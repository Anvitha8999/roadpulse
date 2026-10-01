import pytest

from app.severity import compute_severity


@pytest.mark.parametrize(
    "area_ratio, expected",
    [
        (0.0, 1),
        (0.001, 2),
        (0.01, 3),
        (0.027, 4),
        (0.05, 5),
    ],
)
def test_severity_bands(area_ratio, expected):
    assert compute_severity(area_ratio) == expected


def test_severity_is_monotonic():
    ratios = [i / 1000 for i in range(0, 200)]
    scores = [compute_severity(r) for r in ratios]
    assert scores == sorted(scores)

