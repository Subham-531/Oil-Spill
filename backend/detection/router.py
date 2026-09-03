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
            target_scene = temp_path
        elif scene_id:
            # Check if scene_id matches a pre-staged file
            candidate = DEMO_DIR / scene_id
            if not candidate.exists():
                candidate = DEMO_DIR / f"{scene_id}.tif"
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
