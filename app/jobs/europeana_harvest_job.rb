class EuropeanaHarvestJob
  def initialize(options = {})
    @options = options
    @per_page = 100
    @harvested = 0
    @keep_harvesting = true
  end

  def perform
    start = @options[:start] || 1
    while keep_harvesting?
      harvest_set(start)
      start = start + @per_page
    end
  end
  
private

  def harvest_set(start)
    results = get_api_search_results(start)
    
    if results['items'].blank?
      stop_harvesting
    else
      results['items'].each do |result|
        record_id = result['id']
        create_record(record_id)
        if @options[:limit] && (@harvested >= @options[:limit])
          stop_harvesting
          return
        end
      end
    end
  end
  
  def stop_harvesting
    @keep_harvesting = false
  end
  
  def keep_harvesting?
    @keep_harvesting
  end

  def get_api_search_results(start)
    query_string = '"first world war" OR "world war I" OR "1914-1918" NOT europeana_collectionName:"2020601_Ag_ErsterWeltkrieg_EU"'
    if @options[:query]
      query_string = @options[:query] + ' AND ' + query_string
    end
    query_options = {
      :start    => start,
      :rows     => @per_page,
      :profile  => 'minimal'
    }
    
    Europeana::API::Search.new(query_string).run(query_options)
  end
  
  def get_api_record(record_id)
    response = Europeana::API::Record.get(record_id)
    response['object']
  end
  
  def create_record(record_id)
    record = EuropeanaRecord.find_or_initialize_by_record_id(record_id)
    if record.new_record?
      record.save
      record.index
      Sunspot.commit
      @harvested = @harvested + 1
    end
  rescue ActiveRecord::RecordNotUnique
    # Another DJ process got to this record first, despite 
    # record_id uniqueness validation in EuropeanaRecord. Just ignore it.
  end

end
