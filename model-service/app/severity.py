def compute_severity(area_ratio: float) -> int:
    if area_ratio <= 0:
        return 1
    if area_ratio < 0.005:
        return 2
    if area_ratio < 0.015:
        return 3
    if area_ratio < 0.03:
        return 4
    return 5
