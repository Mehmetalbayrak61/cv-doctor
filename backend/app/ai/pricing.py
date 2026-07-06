"""OpenAI model fiyatlandırması (USD / 1M token) — yaklaşık maliyet hesaplamak için.

Statik bir tablo; OpenAI fiyatlarını güncellediğinde burada da güncellenmelidir.
Bilinmeyen bir model için varsayılan (gpt-4o-mini) fiyatı kullanılır.
"""

_PRICING_PER_MILLION_TOKENS: dict[str, tuple[float, float]] = {
    # model: (input, output)
    "gpt-4o-mini": (0.15, 0.60),
    "gpt-4o": (2.50, 10.00),
    "gpt-4.1": (2.00, 8.00),
    "gpt-4.1-mini": (0.40, 1.60),
}

_DEFAULT_PRICING = _PRICING_PER_MILLION_TOKENS["gpt-4o-mini"]


def estimate_cost_usd(*, model: str, prompt_tokens: int, completion_tokens: int) -> float:
    input_price, output_price = _PRICING_PER_MILLION_TOKENS.get(model, _DEFAULT_PRICING)
    return (prompt_tokens * input_price + completion_tokens * output_price) / 1_000_000
