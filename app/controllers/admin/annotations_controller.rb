class Admin::AnnotationsController < AdminController
  # GET /admin/annotations
  def index
    count = [ (params[:count] || 20).to_i, 100 ].min # Default 20, max 100
    page = (params[:page] || 1).to_i
    limit = count * page
    
    taggings = ActsAsTaggableOn::Tagging.where(:context => 'tags')
    
    total = taggings.count + Annotation.count
    
    items = taggings.order('created_at DESC').limit(limit) +
      Annotation.order('created_at DESC').limit(limit)
      
    @annotations = items.collect do |item|
      case item
      when ActsAsTaggableOn::Tagging
        { 
          :contribution => item.taggable,
          :user => item.tagger,
          :text => item.tag.name,
          :created_at => item.created_at,
          :id => item.id,
          :type => t('activerecord.models.tagging'),
          :status => item.current_status.name,
          :edit => edit_tagging_path(item, :redirect => admin_annotations_path),
          :depublish => depublish_tagging_path(item, :redirect => admin_annotations_path)
        }
      when Annotation
        { 
          :attachment => item.attachment,
          :contribution => item.attachment.contribution,
          :user => item.user,
          :text => item.text,
          :created_at => item.created_at,
          :id => item.id,
          :type => t('activerecord.models.annotation'),
          :status => item.current_status.name,
          :edit => edit_annotation_path(item, :redirect => admin_annotations_path),
          :depublish => nil
        }
      end
    end
    
    @annotations.sort_by! { |a| a[:created_at] }
    @annotations = @annotations.reverse
    
    @annotations = WillPaginate::Collection.create(page, count, total) do |pager|
      if total == 0
        pager.replace([])
      else
        pager.replace(@annotations[pager.offset, pager.per_page])
      end
    end
    
    @annotations.each do |a|
      a[:user_name] = a[:user].contact.full_name
      a[:user_name] = (t('activerecord.models.user') + ' ' + a[:user].id.to_s) unless a[:user_name].present?
    end
  end
end