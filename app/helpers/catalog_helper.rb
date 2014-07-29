module CatalogHelper
  include Blacklight::CatalogHelperBehavior
  
  def blacklight_thumbnail(doc, options)
    if match = doc.id.match(/^Contribution (.+)$/)
      contribution = Contribution.find(match[1])
      if cover_image = contribution.attachments.cover_image
        if cover_image_url = cover_image.thumbnail_url(:preview)
          return image_tag(cover_image_url)
        end
      else
        return image_tag(contribution_media_type_image_path(match[1]), :alt => "")
      end
    elsif match = doc.id.match(/^EuropeanaRecord (.+)$/)
      er = EuropeanaRecord.find(match[1])
      if er.object['europeanaAggregation']['edmPreview'].present?
        return image_tag(er.object['europeanaAggregation']['edmPreview'])
      end
    end
    
    image_tag("style/icons/mimetypes/unknown.png", :alt => t("media_types.unknown"))
  end
end
