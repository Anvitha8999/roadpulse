def compute_severity(area_ratio: float, num_detections: int) -> int:
    if num_detections == 0:
        return 1
    if area_ratio < 0.005:
        score = 2
    elif area_ratio < 0.02:
        score = 3
    elif area_ratio < 0.06:
        score = 4
    else:
        score = 5
    if num_detections >= 3:
        score += 1
    return min(score, 5)
