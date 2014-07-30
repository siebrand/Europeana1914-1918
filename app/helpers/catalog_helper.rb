module CatalogHelper
  include Blacklight::CatalogHelperBehavior
  
  def method_missing(name, *args, &block)
    if name =~ /\Acatalog_(.+)_facet_field_label\Z/
      send(:catalog_facet_field_label, $1, *args)
    else
      super
    end
  end
  
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
  
  def catalog_facet_field_label(facet_name, field_value)
    @@metadata_fields ||= {}

    if field_value.is_a?(Integer) || (field_value.is_a?(String) && field_value =~ /\A\d+\Z/)
      if taxonomy_field_facet = facet_name.to_s.match(/^metadata_(.+)_ids$/)
        field_name = taxonomy_field_facet[1]
        unless @@metadata_fields[field_name]
          @@metadata_fields[field_name] = MetadataField.includes(:taxonomy_terms).find_by_name(field_name)
        end
        if row_term = @@metadata_fields[field_name].taxonomy_terms.select { |term| term.id == field_value.to_i }.first
          if (field_name == 'collection_day') && (collection_day = CollectionDay.find_by_code(row_term.term))
            row_label = collection_day_summary(collection_day)
          else
            row_label = row_term.term
          end
        end
      end
    elsif facet_name.to_s == 'uri'
      row_label = openskos_concept_label(field_value)
      wwi_uri = "http://data.europeana.eu/concept/loc/sh85148236"
      unless wwi_uri == field_value
        wwi_prefix = openskos_concept_label(wwi_uri)
        row_label.sub!(/^#{wwi_prefix} -- /i, '')
      end
    end
    
    row_label || field_value.to_s
  end
end
