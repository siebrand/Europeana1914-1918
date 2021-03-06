class CollectionDay < ActiveRecord::Base
  INVALID_CODES = [ 'INTERNET' ]
  
  belongs_to :taxonomy_term
  belongs_to :contact, :dependent => :destroy
  
  has_many :metadata_records, :through => :taxonomy_term
  has_many :contributions, :through => :metadata_records
  
  accepts_nested_attributes_for :contact
  
  validates :taxonomy_term, :name, :start_date, :contact, :presence => true
  validates :taxonomy_term_id, :uniqueness => true
  validates :description, :length => { :maximum => 1024 }
  validates :map_zoom, :numericality => { :only_integer => true }, :inclusion => { :in => 0..19 }, :allow_nil => true, :allow_blank => true
  validates_associated :contact
  
  validate :validate_taxonomy_term_belongs_to_collection_day_metadata_field
  validate :validate_collection_day_code
  validate :validate_end_date_follows_start_date, :if => Proc.new { |cd| cd.end_date.present? }
  
  after_initialize :initialize_contact
  
  has_attached_file :image,
    :path => (Paperclip::Attachment.default_options[:storage] == :filesystem ? ":rails_root/public/" : "") + "images/collection_days/:id/:style/:filename",
    :url => (Paperclip::Attachment.default_options[:storage] == :s3 ? ":s3_domain_url" : "/images/collection_days/:id/:style/:filename"),
    :styles => { :thumb => "100x100>", :medium => "200x200>" }
  
  validates_attachment_content_type :image, :content_type => [ 'image/jpeg', 'image/pjpeg', 'image/gif' ], :message => I18n.t('activerecord.errors.models.collection_day.attributes.image.content_type')
  
  def code
    taxonomy_term.term
  end
  
  def to_param
    code
  end
  
  def self.find_by_code(code)
    includes(:taxonomy_term).where('taxonomy_terms.term = ?', [ code ]).first
  end
  
  def has_contributions?
    contributions.size > 0
  end
  
protected

  def initialize_contact
    build_contact unless contact.present?
    contact.required_attributes = [ :full_name, :street_address, :locality, :postal_code, :country ]
  end

  def validate_taxonomy_term_belongs_to_collection_day_metadata_field
    unless taxonomy_term.metadata_field.name == 'collection_day'
      errors.add :taxonomy_term_id, I18n.t('activerecord.errors.models.collection_day.taxonomy_term_metadata_field')
    end
  end
  
  def validate_collection_day_code
    if  INVALID_CODES.include?(code)
      errors.add :taxonomy_term_id, I18n.t('activerecord.errors.models.collection_day.taxonomy_term_metadata_field')
    end
  end
  
  def validate_end_date_follows_start_date
    unless end_date > start_date
      errors.add :end_date, I18n.t('activerecord.errors.models.collection_day.end_date_follows_start_date')
    end
  end
  
end
