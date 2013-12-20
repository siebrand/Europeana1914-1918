# encoding: utf-8

require 'digest/md5'

module EuropeanaHelper
  def nav_links
    links = []
    links << [ t('layout.navigation.contribute'), contributor_dashboard_path ]
    links << [ t('layout.navigation.browse'), page_path('browse') ]
    links << [ t('layout.navigation.about'), page_path('about') ]
    links << [ t('layout.navigation.contact'), page_path('contact') ]
    links << [ t('layout.navigation.help'), page_path('help') ]
    links
  end
  
  def form_previous_step_link(url)
    content_tag 'li', :class => 'back' do
      link_to I18n.t('views.links.previous_step'), url
    end
  end
  
  def europeana_record_url(id)
    dataset_id, record_id = id[1..-1].split('/')
    show_europeana_url(:dataset_id => dataset_id, :record_id => record_id)
  end
  
  ##
  # Selects an appropriate value for display of an EDM proxy object field
  #
  # Returns:
  # * a localised version for the user's locale if it exists; or
  # * the first non-empty "def" value if present; or
  # * all non-empty values joined.
  #
  # @param [Hash] proxy Proxy object from an EDM record
  # @param [String] field_name Name of the field to retrieve
  # @return [String] Value to display for the field
  # @todo Add some validation to proxy param to aid debugging
  #
  def edm_proxy_field(proxy, field_name)
    return nil unless proxy.respond_to?(:has_key?) && proxy.has_key?(field_name)
#    logger.debug("EDM proxy field \"#{field_name}\" => #{proxy[field_name].inspect}")
    if proxy[field_name].nil?
      nil
    elsif proxy[field_name].is_a?(String)
      proxy[field_name]
    elsif proxy[field_name].has_key?(I18n.locale.to_s)
      proxy[field_name][I18n.locale.to_s].first
    elsif proxy[field_name]["def"].present? 
      proxy[field_name]["def"].reject(&:blank?).first
    else
      proxy_field = proxy[field_name].values.reject(&:blank?).join(',')
      proxy_field.blank? ? nil : proxy_field
    end
  end
  
  ##
  # Returns the first latitude, longitude pair found in an array of EDM places
  #
  # @param [Array<Hash>] places Array of places data from EDM record
  # @return [String] lat,lng
  #
  def edm_places_latlng(places)
    return nil unless places.respond_to?(:each)
    places.each do |place|
      if place.has_key?("latitude") && place.has_key?("longitude")
        return [ place["latitude"], place["longitude"] ].join(",")
      end
    end
  end
  
  ##
  # Gets the oEmbed HTML from an EDM object's edm:isShownBy aggregation
  #
  # Responses from oEmbed providers are cached for 1 day.
  #
  # @param [Hash] Representation of an EDM object
  # @return [String] HTML for the oEmbed resource
  #
  def oembed_html(edm_object)
    if edm_object['aggregations'] && (url = edm_object['aggregations'].first['edmIsShownBy'])
    
      cache_key = "oembed/response/" + Digest::MD5.hexdigest(url)
      if controller.fragment_exist?(cache_key)
        resource_fields = YAML::load(controller.read_fragment(cache_key))
      elsif provider = OEmbed::Providers.find(url)
        resource = provider.get(url)
        resource_fields = resource.fields
        controller.write_fragment(cache_key, resource_fields.to_yaml, :expires_in => 1.day)
      end

      return resource_fields['html'] unless resource_fields.nil?
    end
    ''
  end
  
  def languageLabel(key)
    languageLabels = {    
      "en" => "English",
      "eu" => "Basque",
      "bg" => "Български",
      "ca" => "Català",
      "cs" => "Čeština",
      "da" => "Dansk",
      "de" => "Deutsch",
      "el" => "Ελληνικά",
      "es" => "Español",
      "et" => "Eesti",
      "fr" => "Français",
      "ga" => "Gaeilge",
      "hr" => "Hrvatski",
      "is" => "Íslenska",
      "it" => "Italiano",
      "lt" => "Lietuvių",
      "lv" => "Latviešu",
      "hu" => "Magyar",
      "mt" => "Malti",
      "nl" => "Nederlands",
      "no" => "Norsk",
      "pl" => "Polski",
      "pt" => "Português",
      "ro" => "Română",
      "ru" => "Русский",
      "sl" => "Slovenščina",
      "sk" => "Slovenský",
      "fi" => "Suomi",
      "sv" => "Svenska",
      "uk" => "Українська"
    }
    languageLabels[key] || key

  end
end
