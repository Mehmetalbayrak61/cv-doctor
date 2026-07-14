from app.core.config import settings
from app.core.exceptions import NotFoundError, UnprocessableEntityError
from app.models.cv_document import CVDocument
from app.storage.factory import get_storage_backend
from app.utils.text_extraction import TextExtractionError, extract_text


class CvTextService:
    """Depodaki CV dosyasını okuyup düz metne çevirir.

    CVAnalysisService ve RewriteService arasında paylaşılan ortak adım —
    her ikisi de AI'ya göndermeden önce aynı extract-and-validate mantığına ihtiyaç duyar.
    """

    def __init__(self) -> None:
        self._storage = get_storage_backend()

    async def extract(self, document: CVDocument) -> str:
        try:
            content = await self._storage.read(document.file_path)
        except FileNotFoundError as exc:
            raise NotFoundError("CV dosyası depoda bulunamadı.") from exc

        try:
            text = extract_text(content=content, mime_type=document.mime_type)
        except TextExtractionError as exc:
            raise UnprocessableEntityError(str(exc)) from exc

        if len(text) > settings.MAX_CV_TEXT_CHARS:
            raise UnprocessableEntityError(
                "CV metni analiz sınırını aşıyor. Lütfen yalnızca özgeçmiş içeriğini içeren "
                "daha kısa bir dosya yükleyin."
            )
        return text
