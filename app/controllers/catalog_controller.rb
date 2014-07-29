class CatalogController < SearchController
  include SearchHelper
  include CollectionDaysHelper
  include Blacklight::Catalog
  
  before_filter :require_solr!
  
  def require_solr!
    unless RunCoCo.configuration.search_engine == :solr
      redirect_to search_contributions_path
    end
  end
  
private
  
  def self.facet_label(provider, facet_name)
    if taxonomy_field_facet = facet_name.to_s.match(/^metadata_(.+)_ids$/)
      field_name = taxonomy_field_facet[1]
    else
      field_name = facet_name
    end
    
    I18n.t("views.search.facets.#{provider.to_s}.#{field_name}", :default => "views.search.facets.common.#{field_name}".to_sym)
  end
  
  configure_blacklight do |config|
    ## Default parameters to send to solr for all search-like requests. See also SolrHelper#solr_search_params
    config.default_solr_params = { 
      :qt => 'search',
      :rows => 10 
    }
    
    # solr field configuration for search results/index views
    config.index.title_field = 'title_text'
#    config.index.display_type_field = 'type_s'
    
#    config.add_facet_field 'format', :label => 'Format'
#    config.add_facet_field 'pub_date', :label => 'Publication Year', :single => true
#    config.add_facet_field 'subject_topic_facet', :label => 'Topic', :limit => 20
#    config.add_facet_field 'language_facet', :label => 'Language', :limit => true
#    config.add_facet_field 'lc_1letter_facet', :label => 'Call Number'
#    config.add_facet_field 'subject_geo_facet', :label => 'Region'
#    config.add_facet_field 'subject_era_facet', :label => 'Era'
    
    # Contribution facets
    MetadataField.where(:facet => true, :field_type => 'taxonomy').each do |field|
      config.add_facet_field "metadata_#{field.name}_ids_im", :label => facet_label(:contributions, field.name)
    end
    config.add_facet_field "place_name_s", :label => facet_label(:contributions, :place_name)
    
    config.add_facet_field "uri_sm", :label => facet_label(:europeana, :uri)
    config.add_facet_field "year_sm", :label => facet_label(:europeana, :year)
    config.add_facet_field "type_s", :label => facet_label(:europeana, :type)
    config.add_facet_field "provider_sm", :label => facet_label(:europeana, :provider)
    config.add_facet_field "data_provider_sm", :label => facet_label(:europeana, :data_provider)
    config.add_facet_field "country_sm", :label => facet_label(:europeana, :country)
    config.add_facet_field "rights_sm", :label => facet_label(:europeana, :rights)
    
    config.add_facet_fields_to_solr_request!
    
    config.add_search_field 'all_fields', :label => 'All Fields'
    
    config.index.thumbnail_method = :blacklight_thumbnail
  end
  
end
