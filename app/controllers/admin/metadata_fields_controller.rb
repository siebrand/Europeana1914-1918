class Admin::MetadataFieldsController < AdminController
  # GET /admin/fields
  def index
    @fields = MetadataField.order('position ASC')
  end

  # GET /admin/fields/order
  def order
    @fields = MetadataField.order('position ASC')
  end
  
  # PUT /admin/fields/order
  def update_order
    params[:fields].each_pair do |id, attrs|
      if attrs.has_key?(:position)
        MetadataField.find(id).update_attributes(:position => attrs[:position])
      end
    end
    flash[:notice] = t('flash.metadata_fields.update_order.notice')
    redirect_to admin_metadata_fields_path
  end

  # GET /admin/fields/new
  def new
    @field = MetadataField.new
  end

  # POST /admin/fields
  def create
    @field = MetadataField.new(params[:metadata_field])
    if @field.save
      flash[:notice] = t('flash.actions.create.notice', :resource_name => MetadataField.model_name.human)
      if @field.has_options?
        redirect_to edit_admin_metadata_field_path(@field, :options => 1)
      else
        redirect_to admin_metadata_fields_path
      end
    else
      flash.now[:alert] = t('flash.actions.create.alert', :resource_name => MetadataField.model_name.human)
      render :action => 'new'
    end
  end

  # GET /admin/fields/:id/edit
  def edit
    @field = MetadataField.find(params[:id])
    @options = params[:options]
  end

  # PUT /admin/fields/:id
  def update
    @field = MetadataField.find(params[:id])
    if @field.update_attributes(params[:metadata_field])
      flash[:notice] = t('flash.actions.update.notice', :resource_name => MetadataField.model_name.human)
      redirect_to admin_metadata_fields_path
    else
      flash.now[:alert] = t('flash.actions.update.alert', :resource_name => MetadataField.model_name.human)
      render :action => 'edit'
    end
  end

  # GET /admin/fields/:id/delete
  def delete
    @field = MetadataField.find(params[:id])
  end

  # DELETE /admin/fields/:id
  def destroy
    @field = MetadataField.find(params[:id]).destroy
    flash[:notice] = t('flash.actions.destroy.notice', :resource_name => MetadataField.model_name.human)
    redirect_to admin_metadata_fields_path
  end
  
protected

  def authorize!
    current_user.may_administer_metadata_fields!
  end
end

