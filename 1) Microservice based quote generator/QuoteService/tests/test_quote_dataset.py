from pathlib import Path

def test_quote_dataset_has_valid_records():
    quote_file = Path(__file__).parents[1] / "quotes.txt"
    lines = [line.strip() for line in quote_file.read_text(encoding="utf-8").splitlines() if line.strip()]
    assert lines, "quotes.txt must contain at least one quote"
    assert all("-" in line for line in lines), "each quote must contain a quote/author separator"
    assert all(len(line.split("-", 1)[1].strip()) > 0 for line in lines), "each quote must include an author"
