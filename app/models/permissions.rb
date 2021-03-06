##
# Aegis roles and permissions.
#
# @see <http://wiki.github.com/makandra/aegis/>.
#
class Permissions < Aegis::Permissions
  role :guest
  role :contributor
  role :cataloguer, :default_permission => :allow
  role :administrator, :default_permission => :allow
  
  action :access_admin_area do
  end
  
  action :administer_users do
    deny :cataloguer
  end
  
  action :administer_institutions do
    deny :cataloguer
  end
  
  action :administer_metadata_fields do
    deny :cataloguer
  end

  action :administer_contributions do
  end
  
  action :administer_settings do
    deny :cataloguer
  end
  
  action :view_logs do
    deny :cataloguer
  end
  
  action :harvest_europeana do
    deny :cataloguer
  end
  
  action :catalogue_contributions do
  end
  
  action :search_contributions do
    if RunCoCo.configuration.publish_contributions?
      allow :everyone
    else
      deny :everyone
    end
  end
  
  action :create_contribution do
    allow :contributor
    allow :guest do
      !RunCoCo.configuration.registration_required? && user.contact.present?
    end
  end
  
  action :view_contribution do
    allow :guest do |contribution|
      (RunCoCo.configuration.publish_contributions? && contribution.published?) ||
      (!RunCoCo.configuration.registration_required? && (contribution.contact == user.contact))
    end
    allow :contributor do |contribution|
      (RunCoCo.configuration.publish_contributions? && contribution.published?) || 
      (contribution.contributor == user)
    end
  end
  
  action :view_contribution_status_log do
  end
  
  action :edit_contribution do
    allow :contributor do |contribution|
      (contribution.contributor == user) && [ :draft, :submitted, :approved, :revised ].include?(contribution.status)
    end
    allow :guest do |contribution|
      !RunCoCo.configuration.registration_required? && (contribution.contact == user.contact) && (contribution.status == :draft)
    end
  end
  
  action :tag_object do
    allow :administrator, :cataloguer, :contributor do |taggable|
      !taggable.respond_to?(:published?) || taggable.published?
    end
  end
  
  action :untag_object do
    allow :cataloguer, :contributor do |taggable, tag|
      taggable.owner_tags_on(user, :tags).include?(tag)
    end
  end
  
  action :flag_object_tag do
    allow :administrator, :cataloguer, :contributor do |taggable, tag|
      user_tagged_object = taggable.owner_tags_on(user, :tags).include?(tag)
      
      taggings = taggable.taggings.select { |tagging| tagging.tag == tag && tagging.context == 'tags' }
      flaggings = taggings.collect(&:taggings).flatten.uniq.select { |tagging| tagging.context == 'flags' }
      flagger_ids = flaggings.collect(&:tagger_id)
      user_flagged_tag = flagger_ids.include?(user.id)

      !user_tagged_object && !user_flagged_tag
    end
  end
  
  action :edit_tagging do
    allow :contributor do :tagging
      tagging.tagger == user
    end
  end
  
  action :approve_contributions do
  end
  
  action :reject_contributions do
  end

  action :delete_contribution do
    allow :contributor do |contribution|
      (contribution.contributor == user) && (contribution.status == :draft)
    end
    allow :guest do |contribution|
      !RunCoCo.configuration.registration_required? && (contribution.contact == user.contact) && (contribution.status == :draft)
    end
  end
  
  action :withdraw_contribution do
    allow :cataloguer, :administrator do |contribution|
      [ :submitted, :approved, :revised ].include?(contribution.status)
    end
    allow :contributor do |contribution|
      (contribution.contributor == user) && ([ :submitted, :approved, :revised ].include?(contribution.status))
    end
  end
  
  action :view_contribution_attachments do
    allow :contributor do |contribution|
      (RunCoCo.configuration.publish_contributions? && contribution.published?) ||
      (contribution.contributor == user)
    end
    allow :guest do |contribution|
      (RunCoCo.configuration.publish_contributions? && contribution.published?) ||
      (!RunCoCo.configuration.registration_required? && (contribution.contact == user.contact))
    end
  end

  action :create_contribution_attachment do
    allow :contributor do |contribution|
      (contribution.contributor == user) && ([ :draft, :submitted, :revised ].include?(contribution.status))
    end
    allow :guest do |contribution|
      !RunCoCo.configuration.registration_required? && (contribution.contact == user.contact) && (contribution.status == :draft)
    end
  end

  action :view_attachment do
    allow :contributor do |attachment|
      (RunCoCo.configuration.publish_contributions? && attachment.public?) || 
      (attachment.contribution.contributor == user)
    end
    allow :guest do |attachment|
      (RunCoCo.configuration.publish_contributions? && attachment.public?) ||
      (!RunCoCo.configuration.registration_required? && (attachment.contribution.contact == user.contact))
    end
  end
  
  action :create_annotation do
    allow :contributor do |annotatable|
      !annotatable.is_a?(Attachment) || annotatable.contribution.published?
    end
  end
  
  action :edit_annotation do
    allow :contributor do |annotation|
      annotation.user == user
    end
  end
  
  action :flag_annotation do
    allow :administrator, :cataloguer, :contributor do |annotation|
      # Flagging permitted if the user: 
      # * Did not create the annotation
      annotation.user != user
    end
  end
  
  action :delete_annotation do
    allow :contributor do |annotation|
      annotation.user == user
    end
  end
  
  action :edit_attachment do
    allow :contributor do |attachment|
      (attachment.contribution.contributor == user) && [ :draft, :submitted, :approved, :revised ].include?(attachment.contribution.status)
    end
    allow :guest do |attachment|
      !RunCoCo.configuration.registration_required? && (attachment.contribution.contact == user.contact) && (attachment.contribution.status == :draft)
    end
  end
  
  action :copy_attachment_metadata do
  end
  
  action :delete_attachment do
    allow :contributor do |attachment| 
      (attachment.contribution.contributor == user) && [ :draft, :submitted ].include?(attachment.contribution.status)
    end
    allow :guest do |attachment|
      !RunCoCo.configuration.registration_required? && (attachment.contribution.contact == user.contact) && (attachment.contribution.status == :draft)
    end
  end
  
  action :view_contact do
    allow :contributor do |contact|
      user.contact == contact
    end
  end

  action :edit_contact do
    allow :contributor do |contact|
      user.contact == contact
    end
  end
  
  action :create_guest_contact do
    # Only guest users can create guest contacts
    deny :cataloguer
    deny :administrator
    allow :guest do
      !RunCoCo.configuration.registration_required? && user.contact_id.nil?
    end
  end
  
  action :edit_guest_contact do
    deny :cataloguer
    deny :administrator
    allow :guest do
      !RunCoCo.configuration.registration_required?
    end
  end
end

