RunCoCo::Application.routes.draw do
  
  themes_for_rails
  
  # Attachments
  scope '/attachments/:id' do
    match ':contribution_id.:id.original.:extension' => 'attachments#download', :as => 'download_contribution_attachment'
    match ':contribution_id.:id.:style.:extension' => 'attachments#inline', :constraints => { :style => /(thumb|preview|medium|large|full)/ }, :as => 'inline_contribution_attachment'
  end

  scope "/:locale" do
    # Contribution resources
    resources :contributions do
      collection do
        get 'search'
        get 'complete'
        get 'feed'
        match 'tagged/:tag' => 'contributions#search', :as => 'tag_search', :via => :get
      end
      member do
        get 'status', :action => 'status_log'
        get 'delete'
        put 'submit'
        put 'approve'
        put 'reject'
        get 'withdraw'
        put 'withdraw', :action => 'set_withdrawn'
      end
      
      # Attachment sub-resources
      resources :attachments do
        member do
          get 'delete'
          get 'copy'
          put 'duplicate'
          get 'uploaded'
        end
      end
      
      # Tags
      resources :tags, :only => [ 'index', 'create', 'edit', 'update', 'destroy' ] do
        member do
          get 'delete'
          get 'flag'
          put 'flag', :action => 'confirm_flag'
        end
      end
    end
    
    match 'explore/:field_name/:term' => 'contributions#explore', :as => 'term_search_contributions', :via => :get
    
    # Annotations
    resources :annotations do
      member do
        get 'depublish'
        put 'depublish', :action => 'confirm_depublish'
        get 'flag'
        put 'flag', :action => 'confirm_flag'
        get 'unflag'
        put 'unflag', :action => 'confirm_unflag'
      end
    end
    
    # Taggings
    resources :taggings, :only => [ 'edit', 'update' ] do
      member do
        get 'depublish'
        put 'depublish', :action => 'confirm_depublish'
      end
    end
    
    # Users
    devise_for :users,
      :path_names => { :sign_in => 'sign-in', :sign_out => 'sign-out', :sign_up => 'register' }
    match 'users/account' => 'users#account', :as => :user_account

    # Contacts
    resources :contacts, :only => [ :edit, :update, :show ]

    # Contributors
    match 'contributor' => 'contributor#dashboard', :as => :contributor_dashboard
    namespace :contributor do
      resource :guest do
        put 'forget'
      end
    end

    # Blog posts
    match 'blog/:blog(/:category)' => 'blog_posts#show', :as => :blog_post, 
      :constraints => { :blog => /(europeana|gwa)/ }, :via => :get
    match 'blogs' => 'blog_posts#show', :as => :blogs_post, :via => :get

    # Europeana API interface
    match 'europeana/search' => 'europeana#search', :as => 'search_europeana', :via => :get
    match 'europeana/explore/:field_name/:term' => 'europeana#explore', :as => 'explore_europeana', :via => :get
    match 'europeana/record/:dataset_id/:record_id' => 'europeana#show', :as => 'show_europeana', :via => :get
    match 'europeana/record/:dataset_id/:record_id/headers' => 'europeana#http_headers', :as => 'show_europeana_http_headers', :via => :get
    match 'europeana/record/:dataset_id/:record_id/content' => 'europeana#http_content', :as => 'show_europeana_http_content', :via => :get
    
    # Federated searches
    match 'canadiana/search' => 'federated_search/canadiana#search', :as => 'search_canadiana', :via => :get
    match 'digitalnz/search' => 'federated_search/digitalnz#search', :as => 'search_digitalnz', :via => :get
    match 'digitalnz/explore/:field_name/:term' => 'federated_search/digitalnz#explore', :as => 'explore_digitalnz', :via => :get
    match 'digitalnz/record/:id' => 'federated_search/digitalnz#show', :as => 'show_digitalnz', :via => :get
    match 'dpla/search' => 'federated_search/dpla#search', :as => 'search_dpla', :via => :get
    match 'dpla/explore/:field_name/:term' => 'federated_search/dpla#explore', :as => 'explore_dpla', :via => :get
    match 'dpla/record/:id' => 'federated_search/dpla#show', :as => 'show_dpla', :via => :get
    match 'trove/search' => 'federated_search/trove#search', :as => 'search_trove', :via => :get
    match 'trove/explore/:field_name/:term' => 'federated_search/trove#explore', :as => 'explore_trove', :via => :get
    match 'trove/record/:id' => 'federated_search/trove#show', :as => 'show_trove', :via => :get

    # Collection search (both Contribution and EuropeanaRecord Solr indexes)
    match 'collection/search' => 'collection#search', :as => 'search_collection', :via => :get
    match 'collection/explore/:field_name/:term' => 'collection#explore', :as => 'explore_collection', :via => :get

    # Public usage statistics
    resources :statistics, :only => :index

    # Admin routes
    match 'admin' => 'admin#index', :as => 'admin_root'
    namespace :admin do
      resources :users do
        get 'delete', :on => :member
        get 'export', :on => :collection
      end
      
      resources :institutions, :except => [ :show ] do
        get 'delete', :on => :member
      end
      
      resources :contributions, :controller => 'contributions', :only => [ :index ] do
        collection do
          get 'search'
          put 'options'
          get 'export'
        end
      end
      
      resources :annotations, :only => :index
      
      resources :exports, :only => [ :index, :show ]
      
      resources :logs, :only => [ :index ]
      
      resources :metadata_fields, :except => [ :show ] do
        collection do
          get 'order'
          put 'order', :action => 'update_order'
        end
        get 'delete', :on => :member
        
        resources :taxonomy_terms do
          collection do
            get 'import'
            post 'import'
          end
          get 'delete', :on => :member
        end
      end
      
      resources :statistics, :only => :index
      
      resources :taggings, :only => :index
      
      scope 'config' do
        match '/' => 'config#index', :as => 'config', :via => :get
        match '/' => 'config#update', :as => 'update_config', :via => :put
        match 'edit' => 'config#edit', :as => 'edit_config', :via => :get
      end
      
      scope 'europeana' do
        match '/' => 'europeana#index', :as => 'europeana', :via => :get
        match '/harvest' => 'europeana#harvest', :as => 'harvest_europeana', :via => :put
      end
    end

    # Dropbox
    match 'dropbox/connect' => 'dropbox#connect', :as => 'dropbox_connect', :via => :get
    match 'dropbox/disconnect' => 'dropbox#disconnect', :as => 'dropbox_disconnect', :via => :get
    match 'dropbox/refresh' => 'dropbox#refresh', :as => 'dropbox_refresh', :via => :get

    # Help documents and custom pages
    match '*path' => 'pages#show', :as => 'page'
  end
  
  # Suggest search index words for auto-complete
  match 'suggest' => 'search_suggestions#query', :as => 'suggest'
  
  # OAI:PMH provider
  match 'oai' => 'OAI#index', :as => 'oai'
  
  # Home page with locale, e.g. /en, /de
  match '/:locale' => "pages#show", :as => 'home'
  
  # Root route, i.e. "/"
  root :to => "pages#show"
end

