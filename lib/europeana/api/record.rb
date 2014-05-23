module Europeana
  module API
    ##
    # Query the Europeana API Record method.
    #
    # @example
    #   id = '/09102/_GNM_1234'
    #   record = Europeana::API::Record.get(id)
    #   record['success'] #=> true
    #   record['object']['title'] #=> "Europeana record title"
    #
    class Record < Base
      ##
      # Base URL for API Record requests, sprintf-formatted.
      #
      # The %s token will be replaced with the recordID.
      #
      BASE_URL = 'http://www.europeana.eu/api/v2/record%s.json'
      
      attr_reader :record_id
      
      class << self
        ##
        # Retrieves a record object over the API.
        #
        # @param [String] record_id Europeana record ID.
        # @return [Hash] Record object.
        # @see http://www.europeana.eu/portal/api-record-json.html Documentation
        #   of response object.
        #
        def get(record_id)
          self.new(record_id).get
        end
      
        def uri(record_id)
          self.new(record_id).uri
        end
      end
      
      def initialize(record_id)
        unless record_id[0] == '/'
          record_id = '/' + record_id
        end
        @record_id = record_id
      end
      
      def get
        record_uri = uri
        Rails.logger.debug("Europeana API record URL: #{record_uri.to_s}")

        response = net_get(record_uri)
        json = JSON.parse(response.body)
        raise Errors::RequestError, json['error'] unless json['success']
        json
      rescue JSON::ParserError
        if response.code.to_i == 404
          # Handle HTML 404 responses on malformed record ID, emulating API's
          # JSON response.
          raise Errors::RequestError, "Invalid record identifier: #{@record_id}"
        else
          raise Errors::ResponseError
        end
      end
      
      def uri
        raise Errors::MissingKeyError unless Europeana::API.key.present?
        
        params = {
          :wskey => Europeana::API.key
        }
        
        uri = URI.parse(sprintf(BASE_URL, record_id))
        uri.query = params.to_query
        uri
      end
    end
  end
end
