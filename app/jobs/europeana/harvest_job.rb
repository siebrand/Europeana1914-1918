module Europeana
  class HarvestJob
    def initialize(options = {})
      @start ||= (options[:start] || 1)
      @query ||= (options[:query] || nil)
      @limit ||= (options[:limit] || nil)
      
      @per_page = 100
      @harvested ||= 0
      @keep_harvesting ||= true
    end

    def perform
      while keep_harvesting?
        harvest_set(@start)
        @start = @start + @per_page
      end
    end
    
    def error(job, exception)
      # Store attributes to resume on next attempt
      job.handler = self
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
          if @limit && (@harvested >= @limit)
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
      query_string = '("first world war" OR "world war I" OR "1914-1918" NOT europeana_collectionName:"2020601_Ag_ErsterWeltkrieg_EU")'
      if @query
        query_string = '(' + @query + ') AND ' + query_string
      end
      query_options = {
        :query    => query_string,
        :start    => start,
        :rows     => @per_page,
        :profile  => 'minimal'
      }
      
      Europeana.search(query_options)
    end
    
    def create_record(record_id)
      record = EuropeanaRecord.find_or_initialize_by_record_id(record_id)
      if record.new_record?
        if record.save
          begin
            record.index
            Sunspot.commit
          rescue
            # Indexing failed; do not store this record
            Delayed::Worker.logger.error("#{self.class.to_s} failed to index Europeana record with ID \"#{record_id}\"")
            record.destroy
            return
          end
        end
        @harvested = @harvested + 1
      end
    rescue ActiveRecord::RecordNotUnique
      # Another DJ process got to this record first, despite 
      # record_id uniqueness validation in EuropeanaRecord. Just ignore it.
    rescue ArgumentError
      # Invalid record ID, caused by data bug in the API. Skip it and a future
      # harvest will pick the record up once its data is fixed.
    end

  end
end
