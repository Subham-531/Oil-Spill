import os
import shutil
import tempfile
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, Query
from fastapi.responses import JSONResponse

router = APIRouter()

DEMO_DIR = Path("data/sar/demo")
INDEX_PATH = DEMO_DIR / "scenes_index.json"

# Maximum acceptable SAR scene upload size (200 MB)
MAX_UPLOAD_BYTES = 200 * 1024 * 1024
# Sentinel-1 TIFF files start with the II*\x00 or MM\x00* TIFF magic bytes
_TIFF_MAGIC = (b"II*\x00", b"MM\x00*")


def _is_tiff_image(data: bytes) -> bool:
    """Verify TIFF file magic bytes to reject non-image uploads."""
    return data[:4] in _TIFF_MAGIC


def _safe_scene_id(scene_id: str) -> str:
    """Strip directory traversal characters from a user-supplied scene id."""
    return os.path.basename(scene_id)


@router.get("/scenes")
async def list_sar_scenes():
    """Return catalog of available pre-staged SAR scenes."""
    import json

    if INDEX_PATH.exists():
        with open(INDEX_PATH, "r") as f:
            scenes = json.load(f)
        return {"scenes": scenes, "count": len(scenes)}
    return {"scenes": [], "count": 0}


@router.post("/")
async def run_detection(
    scene_file: UploadFile = File(None),
    scene_id: Optional[str] = Query(None),
):
    """
    Run oil spill detection on a SAR scene.
    Accepts an uploaded file OR a pre-staged scene_id / filename from data/sar/demo.
    """
    from backend.detection.detector import get_detector

    detector = get_detector()
    if not detector.model_loaded:
        return JSONResponse(
            status_code=503,
            content={
                "error": "Detection model weights not found. Please verify models/unet_spill_weights.pt."
            },
        )

    temp_path = None
    try:
        if scene_file and scene_file.filename:
            fd, temp_path = tempfile.mkstemp(suffix=".tif")
            with os.fdopen(fd, "wb") as buffer:
                shutil.copyfileobj(scene_file.file, buffer)

            file_size = os.path.getsize(temp_path)
            if file_size > MAX_UPLOAD_BYTES:
                return JSONResponse(
                    status_code=413,
                    content={
                        "error": (
                            f"Uploaded file too large ({file_size / 1e6:.1f} MB). "
                            f"Maximum allowed size is {MAX_UPLOAD_BYTES / 1e6:.0f} MB."
                        )
                    },
                )

            with open(temp_path, "rb") as f:
                header = f.read(4)
            if not _is_tiff_image(header):
                return JSONResponse(
                    status_code=400,
                    content={
                        "error": "Uploaded file is not a valid TIFF SAR scene."
                    },
                )

            target_scene = temp_path
        elif scene_id:
            safe_id = _safe_scene_id(scene_id)
            # Check if scene_id matches a pre-staged file
            candidate = DEMO_DIR / safe_id
            if not candidate.exists():
                candidate = DEMO_DIR / f"{safe_id}.tif"
            if not candidate.exists():
                # Check scenes_index
                if INDEX_PATH.exists():
                    import json

                    with open(INDEX_PATH, "r") as f:
                        sc_list = json.load(f)
                    for sc in sc_list:
                        if sc.get("id") == scene_id or sc.get("filename") == scene_id:
                            candidate = DEMO_DIR / sc["filename"]
                            break

            if candidate.exists():
                target_scene = str(candidate)
            else:
                return JSONResponse(
                    status_code=404,
                    content={"error": f"SAR scene '{scene_id}' not found."},
                )
        else:
            default_scene = Path("data/sar/sample_spill.tif")
            if not default_scene.exists():
                default_scene = DEMO_DIR / "sar_scene_01_fresh_linear_slick.tif"
            if not default_scene.exists():
                return JSONResponse(
                    status_code=400,
                    content={"error": "No scene uploaded and default scene not found."},
                )
            target_scene = str(default_scene)

        geojson_result = detector.detect_spill(target_scene)
        return geojson_result

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)
