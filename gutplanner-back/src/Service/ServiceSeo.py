from xml.etree.ElementTree import Element, SubElement, tostring
from src.Core.Config import Config


class ServiceSeo:
    def __init__(self, config: Config):
        self.config = config

    def robots(self) -> str:
        return f"User-agent: *\nDisallow: /api/\nDisallow: /user\nDisallow: /cadastro\nDisallow: /recuperacao\nSitemap: {self.config.publicUrl}/sitemap.xml\n"

    def sitemap(self) -> str:
        root = Element("urlset", xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")
        for path in ("/", "/contato"):
            entry = SubElement(root, "url")
            SubElement(entry, "loc").text = self.config.publicUrl + path
        return tostring(root, encoding="unicode", xml_declaration=True)
