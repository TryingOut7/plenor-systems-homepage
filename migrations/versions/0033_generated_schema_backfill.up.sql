-- Permanent drift-reconciliation migration.
--
-- Why this exists:
-- 1) Some long-lived environments were missing Payload runtime tables/columns/enums
--    due to historical drift between push-mode and migration-mode states.
-- 2) The production hotfix used one-off SQL/scripts. This migration codifies that
--    repair path so future environments are reproducible via normal migrations.
--
-- Safety characteristics:
-- - Idempotent (CREATE/ALTER IF NOT EXISTS where possible)
-- - Safe on already-repaired environments
-- - Does not drop objects or narrow types

DO $$
DECLARE
  table_manifest jsonb := $table_manifest${
  "_blog_posts_v": {
    "created_at": "timestamp(3) with time zone",
    "id": "serial",
    "latest": "boolean",
    "parent_id": "integer",
    "updated_at": "timestamp(3) with time zone",
    "version__status": "enum__blog_posts_v_version_status",
    "version_approved_at": "timestamp(3) with time zone",
    "version_approved_by_id": "integer",
    "version_body": "jsonb",
    "version_category_id": "integer",
    "version_cover_image_id": "integer",
    "version_created_at": "timestamp(3) with time zone",
    "version_created_by_id": "integer",
    "version_deleted_at": "timestamp(3) with time zone",
    "version_excerpt": "varchar",
    "version_is_featured": "boolean",
    "version_locale": "enum__blog_posts_v_version_locale",
    "version_meta_description": "varchar",
    "version_meta_image_id": "integer",
    "version_meta_title": "varchar",
    "version_published_at": "timestamp(3) with time zone",
    "version_reading_time_minutes": "numeric",
    "version_rejection_reason": "varchar",
    "version_resource_file_id": "integer",
    "version_resource_url": "varchar",
    "version_review_checklist_complete": "boolean",
    "version_review_summary": "varchar",
    "version_seo_canonical_url": "varchar",
    "version_seo_include_in_sitemap": "boolean",
    "version_seo_meta_description": "varchar",
    "version_seo_meta_title": "varchar",
    "version_seo_nofollow": "boolean",
    "version_seo_noindex": "boolean",
    "version_seo_og_description": "varchar",
    "version_seo_og_image_id": "integer",
    "version_seo_og_title": "varchar",
    "version_slug": "varchar",
    "version_submitted_at": "timestamp(3) with time zone",
    "version_submitted_by_id": "integer",
    "version_title": "varchar",
    "version_translation_group_id": "varchar",
    "version_updated_at": "timestamp(3) with time zone",
    "version_workflow_status": "enum__blog_posts_v_version_workflow_status"
  },
  "_blog_posts_v_version_tags": {
    "_order": "integer",
    "_parent_id": "integer",
    "_uuid": "varchar",
    "id": "serial",
    "tag": "varchar"
  },
  "_logos_v": {
    "created_at": "timestamp(3) with time zone",
    "id": "serial",
    "latest": "boolean",
    "parent_id": "integer",
    "updated_at": "timestamp(3) with time zone",
    "version__status": "enum__logos_v_version_status",
    "version_approved_at": "timestamp(3) with time zone",
    "version_approved_by_id": "integer",
    "version_created_at": "timestamp(3) with time zone",
    "version_deleted_at": "timestamp(3) with time zone",
    "version_image_id": "integer",
    "version_name": "varchar",
    "version_order": "numeric",
    "version_rejection_reason": "varchar",
    "version_review_checklist_complete": "boolean",
    "version_review_summary": "varchar",
    "version_submitted_at": "timestamp(3) with time zone",
    "version_submitted_by_id": "integer",
    "version_updated_at": "timestamp(3) with time zone",
    "version_url": "varchar",
    "version_workflow_status": "enum__logos_v_version_workflow_status"
  },
  "_nav_children_v": {
    "_order": "integer",
    "_parent_id": "integer",
    "_uuid": "varchar",
    "href": "varchar",
    "id": "serial",
    "label": "varchar"
  },
  "_org_about_profiles_v": {
    "created_at": "timestamp(3) with time zone",
    "id": "serial",
    "latest": "boolean",
    "parent_id": "integer",
    "updated_at": "timestamp(3) with time zone",
    "version__status": "enum__org_about_profiles_v_version_status",
    "version_affiliation": "varchar",
    "version_approved_at": "timestamp(3) with time zone",
    "version_approved_by_id": "integer",
    "version_category": "enum__org_about_profiles_v_version_category",
    "version_created_at": "timestamp(3) with time zone",
    "version_created_by_id": "integer",
    "version_detail_content": "jsonb",
    "version_display_order": "numeric",
    "version_external_link": "varchar",
    "version_name": "varchar",
    "version_profile_image_id": "integer",
    "version_rejection_reason": "varchar",
    "version_review_checklist_complete": "boolean",
    "version_review_summary": "varchar",
    "version_role_title": "varchar",
    "version_seo_canonical_url": "varchar",
    "version_seo_include_in_sitemap": "boolean",
    "version_seo_meta_description": "varchar",
    "version_seo_meta_title": "varchar",
    "version_seo_nofollow": "boolean",
    "version_seo_noindex": "boolean",
    "version_seo_og_description": "varchar",
    "version_seo_og_image_id": "integer",
    "version_seo_og_title": "varchar",
    "version_short_bio": "varchar",
    "version_slug": "varchar",
    "version_submitted_at": "timestamp(3) with time zone",
    "version_submitted_by_id": "integer",
    "version_updated_at": "timestamp(3) with time zone",
    "version_workflow_status": "enum__org_about_profiles_v_version_workflow_status"
  },
  "_org_about_profiles_v_version_additional_images": {
    "_order": "integer",
    "_parent_id": "integer",
    "_uuid": "varchar",
    "id": "serial",
    "image_id": "integer"
  },
  "_org_events_v": {
    "created_at": "timestamp(3) with time zone",
    "id": "serial",
    "latest": "boolean",
    "parent_id": "integer",
    "updated_at": "timestamp(3) with time zone",
    "version__status": "enum__org_events_v_version_status",
    "version_approved_at": "timestamp(3) with time zone",
    "version_approved_by_id": "integer",
    "version_created_at": "timestamp(3) with time zone",
    "version_created_by_id": "integer",
    "version_description": "jsonb",
    "version_display_priority": "numeric",
    "version_display_window_end": "timestamp(3) with time zone",
    "version_display_window_start": "timestamp(3) with time zone",
    "version_end_date": "timestamp(3) with time zone",
    "version_end_time": "varchar",
    "version_event_status": "enum__org_events_v_version_event_status",
    "version_event_timezone": "varchar",
    "version_event_type": "enum__org_events_v_version_event_type",
    "version_hero_image_id": "integer",
    "version_is_featured": "boolean",
    "version_location": "varchar",
    "version_max_registrations": "numeric",
    "version_payment_instructions": "jsonb",
    "version_payment_reference_format": "varchar",
    "version_payment_required": "boolean",
    "version_registration_closes_at": "timestamp(3) with time zone",
    "version_registration_instructions": "jsonb",
    "version_registration_opens_at": "timestamp(3) with time zone",
    "version_registration_required": "boolean",
    "version_rejection_reason": "varchar",
    "version_review_checklist_complete": "boolean",
    "version_review_summary": "varchar",
    "version_seo_canonical_url": "varchar",
    "version_seo_include_in_sitemap": "boolean",
    "version_seo_meta_description": "varchar",
    "version_seo_meta_title": "varchar",
    "version_seo_nofollow": "boolean",
    "version_seo_noindex": "boolean",
    "version_seo_og_description": "varchar",
    "version_seo_og_image_id": "integer",
    "version_seo_og_title": "varchar",
    "version_short_summary": "varchar",
    "version_slug": "varchar",
    "version_start_date": "timestamp(3) with time zone",
    "version_start_time": "varchar",
    "version_submitted_at": "timestamp(3) with time zone",
    "version_submitted_by_id": "integer",
    "version_title": "varchar",
    "version_updated_at": "timestamp(3) with time zone",
    "version_venmo_qr_code_id": "integer",
    "version_venue": "varchar",
    "version_workflow_status": "enum__org_events_v_version_workflow_status",
    "version_zelle_qr_code_id": "integer"
  },
  "_org_events_v_rels": {
    "id": "serial",
    "order": "integer",
    "org_events_id": "integer",
    "org_learning_id": "integer",
    "org_spotlight_id": "integer",
    "parent_id": "integer",
    "path": "varchar"
  },
  "_org_events_v_version_external_links": {
    "_order": "integer",
    "_parent_id": "integer",
    "_uuid": "varchar",
    "id": "serial",
    "label": "varchar",
    "url": "varchar"
  },
  "_org_events_v_version_media_gallery": {
    "_order": "integer",
    "_parent_id": "integer",
    "_uuid": "varchar",
    "id": "serial",
    "image_id": "integer"
  },
  "_org_home_features_v": {
    "created_at": "timestamp(3) with time zone",
    "id": "serial",
    "latest": "boolean",
    "updated_at": "timestamp(3) with time zone",
    "version__status": "enum__org_home_features_v_version_status",
    "version_created_at": "timestamp(3) with time zone",
    "version_events_placeholder": "varchar",
    "version_learning_placeholder": "varchar",
    "version_spotlight_placeholder": "varchar",
    "version_updated_at": "timestamp(3) with time zone"
  },
  "_org_home_features_v_rels": {
    "id": "serial",
    "order": "integer",
    "org_events_id": "integer",
    "org_learning_id": "integer",
    "org_spotlight_id": "integer",
    "parent_id": "integer",
    "path": "varchar"
  },
  "_org_home_features_v_version_home_section_order": {
    "id": "serial",
    "order": "integer",
    "parent_id": "integer",
    "value": "enum__org_home_features_v_version_home_section_order"
  },
  "_org_learning_v": {
    "created_at": "timestamp(3) with time zone",
    "id": "serial",
    "latest": "boolean",
    "parent_id": "integer",
    "updated_at": "timestamp(3) with time zone",
    "version__status": "enum__org_learning_v_version_status",
    "version_approved_at": "timestamp(3) with time zone",
    "version_approved_by_id": "integer",
    "version_author": "varchar",
    "version_category": "enum__org_learning_v_version_category",
    "version_created_at": "timestamp(3) with time zone",
    "version_created_by_id": "integer",
    "version_detail_content": "jsonb",
    "version_display_order": "numeric",
    "version_external_reference_link": "varchar",
    "version_is_featured": "boolean",
    "version_rejection_reason": "varchar",
    "version_related_event_id": "integer",
    "version_related_spotlight_id": "integer",
    "version_review_checklist_complete": "boolean",
    "version_review_summary": "varchar",
    "version_seo_canonical_url": "varchar",
    "version_seo_include_in_sitemap": "boolean",
    "version_seo_meta_description": "varchar",
    "version_seo_meta_title": "varchar",
    "version_seo_nofollow": "boolean",
    "version_seo_noindex": "boolean",
    "version_seo_og_description": "varchar",
    "version_seo_og_image_id": "integer",
    "version_seo_og_title": "varchar",
    "version_short_summary": "varchar",
    "version_slug": "varchar",
    "version_submitted_at": "timestamp(3) with time zone",
    "version_submitted_by_id": "integer",
    "version_thumbnail_id": "integer",
    "version_title": "varchar",
    "version_updated_at": "timestamp(3) with time zone",
    "version_workflow_status": "enum__org_learning_v_version_workflow_status"
  },
  "_org_sponsors_v": {
    "created_at": "timestamp(3) with time zone",
    "id": "serial",
    "latest": "boolean",
    "updated_at": "timestamp(3) with time zone",
    "version__status": "enum__org_sponsors_v_version_status",
    "version_created_at": "timestamp(3) with time zone",
    "version_donation_instructions": "jsonb",
    "version_featured_supporter_text": "jsonb",
    "version_page_title": "varchar",
    "version_payment_instructions_content": "jsonb",
    "version_sponsor_acknowledgment_content": "jsonb",
    "version_support_contact_path": "varchar",
    "version_support_summary": "jsonb",
    "version_updated_at": "timestamp(3) with time zone",
    "version_venmo_qr_code_id": "integer",
    "version_zelle_qr_code_id": "integer"
  },
  "_org_sponsors_v_version_display_order": {
    "id": "serial",
    "order": "integer",
    "parent_id": "integer",
    "value": "enum__org_sponsors_v_version_display_order"
  },
  "_org_sponsors_v_version_sponsor_logos": {
    "_order": "integer",
    "_parent_id": "integer",
    "_uuid": "varchar",
    "id": "serial",
    "label": "varchar",
    "logo_id": "integer"
  },
  "_org_sponsors_v_version_support_faq": {
    "_order": "integer",
    "_parent_id": "integer",
    "_uuid": "varchar",
    "answer": "varchar",
    "id": "serial",
    "question": "varchar"
  },
  "_org_spotlight_v": {
    "created_at": "timestamp(3) with time zone",
    "id": "serial",
    "latest": "boolean",
    "parent_id": "integer",
    "updated_at": "timestamp(3) with time zone",
    "version__status": "enum__org_spotlight_v_version_status",
    "version_affiliation": "varchar",
    "version_approved_at": "timestamp(3) with time zone",
    "version_approved_by_id": "integer",
    "version_category": "enum__org_spotlight_v_version_category",
    "version_created_at": "timestamp(3) with time zone",
    "version_created_by_id": "integer",
    "version_detail_content": "jsonb",
    "version_display_order": "numeric",
    "version_external_link": "varchar",
    "version_is_featured": "boolean",
    "version_name": "varchar",
    "version_rejection_reason": "varchar",
    "version_review_checklist_complete": "boolean",
    "version_review_summary": "varchar",
    "version_role_title": "varchar",
    "version_seo_canonical_url": "varchar",
    "version_seo_include_in_sitemap": "boolean",
    "version_seo_meta_description": "varchar",
    "version_seo_meta_title": "varchar",
    "version_seo_nofollow": "boolean",
    "version_seo_noindex": "boolean",
    "version_seo_og_description": "varchar",
    "version_seo_og_image_id": "integer",
    "version_seo_og_title": "varchar",
    "version_short_summary": "varchar",
    "version_slug": "varchar",
    "version_submitted_at": "timestamp(3) with time zone",
    "version_submitted_by_id": "integer",
    "version_thumbnail_image_id": "integer",
    "version_updated_at": "timestamp(3) with time zone",
    "version_workflow_status": "enum__org_spotlight_v_version_workflow_status"
  },
  "_org_spotlight_v_rels": {
    "id": "serial",
    "order": "integer",
    "org_events_id": "integer",
    "parent_id": "integer",
    "path": "varchar"
  },
  "_org_spotlight_v_version_additional_images": {
    "_order": "integer",
    "_parent_id": "integer",
    "_uuid": "varchar",
    "id": "serial",
    "image_id": "integer"
  },
  "_service_items_v": {
    "created_at": "timestamp(3) with time zone",
    "id": "serial",
    "latest": "boolean",
    "parent_id": "integer",
    "updated_at": "timestamp(3) with time zone",
    "version__status": "enum__service_items_v_version_status",
    "version_approved_at": "timestamp(3) with time zone",
    "version_approved_by_id": "integer",
    "version_body": "jsonb",
    "version_created_at": "timestamp(3) with time zone",
    "version_created_by_id": "integer",
    "version_currency": "enum__service_items_v_version_currency",
    "version_deleted_at": "timestamp(3) with time zone",
    "version_hero_image_id": "integer",
    "version_is_featured": "boolean",
    "version_locale": "enum__service_items_v_version_locale",
    "version_meta_description": "varchar",
    "version_meta_image_id": "integer",
    "version_meta_title": "varchar",
    "version_price_from": "numeric",
    "version_rejection_reason": "varchar",
    "version_review_checklist_complete": "boolean",
    "version_review_summary": "varchar",
    "version_seo_canonical_url": "varchar",
    "version_seo_include_in_sitemap": "boolean",
    "version_seo_meta_description": "varchar",
    "version_seo_meta_title": "varchar",
    "version_seo_nofollow": "boolean",
    "version_seo_noindex": "boolean",
    "version_seo_og_description": "varchar",
    "version_seo_og_image_id": "integer",
    "version_seo_og_title": "varchar",
    "version_slug": "varchar",
    "version_submitted_at": "timestamp(3) with time zone",
    "version_submitted_by_id": "integer",
    "version_summary": "varchar",
    "version_title": "varchar",
    "version_translation_group_id": "varchar",
    "version_updated_at": "timestamp(3) with time zone",
    "version_workflow_status": "enum__service_items_v_version_workflow_status"
  },
  "_service_items_v_version_tags": {
    "_order": "integer",
    "_parent_id": "integer",
    "_uuid": "varchar",
    "id": "serial",
    "tag": "varchar"
  },
  "_site_settings_v": {
    "created_at": "timestamp(3) with time zone",
    "id": "serial",
    "latest": "boolean",
    "updated_at": "timestamp(3) with time zone",
    "version__status": "enum__site_settings_v_version_status",
    "version_analytics_id": "varchar",
    "version_announcement_banner_background_color": "varchar",
    "version_announcement_banner_enabled": "boolean",
    "version_announcement_banner_link_href": "varchar",
    "version_announcement_banner_link_label": "varchar",
    "version_announcement_banner_text": "varchar",
    "version_announcement_banner_text_color": "varchar",
    "version_brand_tagline": "varchar",
    "version_contact_email": "varchar",
    "version_content_routing_guide_page_url": "varchar",
    "version_content_routing_guide_pdf_url": "varchar",
    "version_content_routing_guide_title": "varchar",
    "version_content_routing_privacy_policy_url": "varchar",
    "version_content_routing_workflow_notify_email": "varchar",
    "version_cookie_banner_accept_label": "varchar",
    "version_cookie_banner_decline_label": "varchar",
    "version_cookie_banner_message": "varchar",
    "version_cookie_banner_privacy_href": "varchar",
    "version_cookie_banner_privacy_label": "varchar",
    "version_copyright_text": "varchar",
    "version_core_preset_content_about": "jsonb",
    "version_core_preset_content_contact": "jsonb",
    "version_core_preset_content_home": "jsonb",
    "version_core_preset_content_pricing": "jsonb",
    "version_core_preset_content_services": "jsonb",
    "version_created_at": "timestamp(3) with time zone",
    "version_default_seo_canonical_url": "varchar",
    "version_default_seo_include_in_sitemap": "boolean",
    "version_default_seo_meta_description": "varchar",
    "version_default_seo_meta_title": "varchar",
    "version_default_seo_nofollow": "boolean",
    "version_default_seo_noindex": "boolean",
    "version_default_seo_og_description": "varchar",
    "version_default_seo_og_image_id": "integer",
    "version_default_seo_og_title": "varchar",
    "version_email_defaults_brand_name": "varchar",
    "version_email_defaults_guide_body": "varchar",
    "version_email_defaults_guide_button_label": "varchar",
    "version_email_defaults_guide_heading": "varchar",
    "version_email_defaults_guide_subject": "varchar",
    "version_email_defaults_inquiry_ack_body": "varchar",
    "version_email_defaults_inquiry_ack_heading": "varchar",
    "version_email_defaults_inquiry_ack_subject": "varchar",
    "version_email_defaults_inquiry_notification_subject": "varchar",
    "version_footer_legal_href": "varchar",
    "version_footer_legal_label": "varchar",
    "version_guide_form_email_placeholder": "varchar",
    "version_guide_form_footer_text": "varchar",
    "version_guide_form_name_placeholder": "varchar",
    "version_guide_form_privacy_href": "varchar",
    "version_guide_form_privacy_label": "varchar",
    "version_guide_form_submit_label": "varchar",
    "version_guide_form_submitting_label": "varchar",
    "version_guide_form_success_body": "varchar",
    "version_guide_form_success_heading": "varchar",
    "version_inquiry_form_challenge_placeholder": "varchar",
    "version_inquiry_form_company_placeholder": "varchar",
    "version_inquiry_form_consent_text": "varchar",
    "version_inquiry_form_email_placeholder": "varchar",
    "version_inquiry_form_name_placeholder": "varchar",
    "version_inquiry_form_privacy_href": "varchar",
    "version_inquiry_form_privacy_label": "varchar",
    "version_inquiry_form_submit_label": "varchar",
    "version_inquiry_form_submitting_label": "varchar",
    "version_inquiry_form_success_body": "varchar",
    "version_inquiry_form_success_heading": "varchar",
    "version_json_ld_organization_email": "varchar",
    "version_json_ld_organization_name": "varchar",
    "version_json_ld_organization_url": "varchar",
    "version_logo_image_id": "integer",
    "version_logo_width": "numeric",
    "version_meta_description": "varchar",
    "version_meta_image_id": "integer",
    "version_meta_title": "varchar",
    "version_not_found_page_body": "varchar",
    "version_not_found_page_button_href": "varchar",
    "version_not_found_page_button_label": "varchar",
    "version_not_found_page_heading": "varchar",
    "version_not_found_page_meta_description": "varchar",
    "version_not_found_page_meta_title": "varchar",
    "version_privacy_last_updated": "varchar",
    "version_privacy_policy": "jsonb",
    "version_site_name": "varchar",
    "version_site_url": "varchar",
    "version_twitter_handle": "varchar",
    "version_updated_at": "timestamp(3) with time zone"
  },
  "_site_settings_v_version_footer_columns": {
    "_order": "integer",
    "_parent_id": "integer",
    "_uuid": "varchar",
    "id": "serial",
    "title": "varchar"
  },
  "_site_settings_v_version_footer_columns_links": {
    "_order": "integer",
    "_parent_id": "integer",
    "_uuid": "varchar",
    "href": "varchar",
    "id": "serial",
    "label": "varchar"
  },
  "_site_settings_v_version_header_buttons": {
    "_order": "integer",
    "_parent_id": "integer",
    "_uuid": "varchar",
    "href": "varchar",
    "id": "serial",
    "is_visible": "boolean",
    "label": "varchar",
    "variant": "enum__site_settings_v_version_header_buttons_variant"
  },
  "_site_settings_v_version_json_ld_same_as": {
    "_order": "integer",
    "_parent_id": "integer",
    "_uuid": "varchar",
    "id": "serial",
    "url": "varchar"
  },
  "_site_settings_v_version_navigation_links": {
    "_order": "integer",
    "_parent_id": "integer",
    "_uuid": "varchar",
    "href": "varchar",
    "id": "serial",
    "is_visible": "boolean",
    "label": "varchar"
  },
  "_site_settings_v_version_social_links": {
    "_order": "integer",
    "_parent_id": "integer",
    "_uuid": "varchar",
    "id": "serial",
    "label": "varchar",
    "url": "varchar"
  },
  "_team_members_v": {
    "created_at": "timestamp(3) with time zone",
    "id": "serial",
    "latest": "boolean",
    "parent_id": "integer",
    "updated_at": "timestamp(3) with time zone",
    "version__status": "enum__team_members_v_version_status",
    "version_approved_at": "timestamp(3) with time zone",
    "version_approved_by_id": "integer",
    "version_bio": "varchar",
    "version_created_at": "timestamp(3) with time zone",
    "version_created_by_id": "integer",
    "version_deleted_at": "timestamp(3) with time zone",
    "version_linkedin_url": "varchar",
    "version_name": "varchar",
    "version_order": "numeric",
    "version_photo_id": "integer",
    "version_rejection_reason": "varchar",
    "version_review_checklist_complete": "boolean",
    "version_review_summary": "varchar",
    "version_role": "varchar",
    "version_submitted_at": "timestamp(3) with time zone",
    "version_submitted_by_id": "integer",
    "version_twitter_url": "varchar",
    "version_updated_at": "timestamp(3) with time zone",
    "version_workflow_status": "enum__team_members_v_version_workflow_status"
  },
  "_testimonials_v": {
    "created_at": "timestamp(3) with time zone",
    "id": "serial",
    "latest": "boolean",
    "parent_id": "integer",
    "updated_at": "timestamp(3) with time zone",
    "version__status": "enum__testimonials_v_version_status",
    "version_approved_at": "timestamp(3) with time zone",
    "version_approved_by_id": "integer",
    "version_avatar_id": "integer",
    "version_company": "varchar",
    "version_created_at": "timestamp(3) with time zone",
    "version_created_by_id": "integer",
    "version_deleted_at": "timestamp(3) with time zone",
    "version_details": "jsonb",
    "version_is_featured": "boolean",
    "version_locale": "enum__testimonials_v_version_locale",
    "version_meta_description": "varchar",
    "version_meta_image_id": "integer",
    "version_meta_title": "varchar",
    "version_name": "varchar",
    "version_quote": "varchar",
    "version_rating": "numeric",
    "version_rejection_reason": "varchar",
    "version_review_checklist_complete": "boolean",
    "version_review_summary": "varchar",
    "version_role": "varchar",
    "version_slug": "varchar",
    "version_submitted_at": "timestamp(3) with time zone",
    "version_submitted_by_id": "integer",
    "version_translation_group_id": "varchar",
    "version_updated_at": "timestamp(3) with time zone",
    "version_workflow_status": "enum__testimonials_v_version_workflow_status"
  },
  "_testimonials_v_version_tags": {
    "_order": "integer",
    "_parent_id": "integer",
    "_uuid": "varchar",
    "id": "serial",
    "tag": "varchar"
  },
  "_ui_settings_v": {
    "created_at": "timestamp(3) with time zone",
    "id": "serial",
    "latest": "boolean",
    "updated_at": "timestamp(3) with time zone",
    "version__status": "enum__ui_settings_v_version_status",
    "version_buttons_ghost_background": "varchar",
    "version_buttons_ghost_background_hover": "varchar",
    "version_buttons_ghost_text": "varchar",
    "version_buttons_nav_background": "varchar",
    "version_buttons_nav_background_hover": "varchar",
    "version_buttons_nav_text": "varchar",
    "version_buttons_primary_background": "varchar",
    "version_buttons_primary_background_hover": "varchar",
    "version_buttons_primary_text": "varchar",
    "version_buttons_radius": "numeric",
    "version_buttons_secondary_background": "varchar",
    "version_buttons_secondary_background_hover": "varchar",
    "version_buttons_secondary_text": "varchar",
    "version_buttons_secondary_text_hover": "varchar",
    "version_colors_background": "varchar",
    "version_colors_black_background": "varchar",
    "version_colors_border": "varchar",
    "version_colors_charcoal_background": "varchar",
    "version_colors_cookie_background": "varchar",
    "version_colors_cookie_link": "varchar",
    "version_colors_cookie_text": "varchar",
    "version_colors_dark_text": "varchar",
    "version_colors_dark_text_muted": "varchar",
    "version_colors_focus_ring": "varchar",
    "version_colors_footer_background": "varchar",
    "version_colors_footer_muted_text": "varchar",
    "version_colors_footer_text": "varchar",
    "version_colors_hero_background": "varchar",
    "version_colors_hero_muted_text": "varchar",
    "version_colors_hero_text": "varchar",
    "version_colors_link": "varchar",
    "version_colors_nav_background": "varchar",
    "version_colors_nav_border": "varchar",
    "version_colors_nav_scrolled_background": "varchar",
    "version_colors_navy_background": "varchar",
    "version_colors_primary": "varchar",
    "version_colors_primary_hover": "varchar",
    "version_colors_section_alt": "varchar",
    "version_colors_surface": "varchar",
    "version_colors_text": "varchar",
    "version_colors_text_muted": "varchar",
    "version_created_at": "timestamp(3) with time zone",
    "version_email_palette_background": "varchar",
    "version_email_palette_border": "varchar",
    "version_email_palette_error": "varchar",
    "version_email_palette_muted": "varchar",
    "version_email_palette_primary": "varchar",
    "version_email_palette_text": "varchar",
    "version_email_palette_white": "varchar",
    "version_layout_card_radius": "numeric",
    "version_layout_container_max_width": "varchar",
    "version_layout_hero_padding_compact": "varchar",
    "version_layout_hero_padding_regular": "varchar",
    "version_layout_hero_padding_spacious": "varchar",
    "version_layout_mobile_section_padding": "varchar",
    "version_layout_nav_height": "numeric",
    "version_layout_section_padding_compact": "varchar",
    "version_layout_section_padding_regular": "varchar",
    "version_layout_section_padding_spacious": "varchar",
    "version_typography_base_font_size": "numeric",
    "version_typography_base_line_height": "numeric",
    "version_typography_body_font_family": "varchar",
    "version_typography_body_font_url": "varchar",
    "version_typography_display_font_family": "varchar",
    "version_typography_heading_font_url": "varchar",
    "version_typography_heading_letter_spacing": "varchar",
    "version_typography_section_label_letter_spacing": "varchar",
    "version_updated_at": "timestamp(3) with time zone"
  },
  "audit_logs": {
    "action": "enum_audit_logs_action",
    "collection": "varchar",
    "created_at": "timestamp(3) with time zone",
    "document_id": "varchar",
    "document_title": "varchar",
    "field_path": "varchar",
    "id": "serial",
    "ip_address": "varchar",
    "new_value_summary": "varchar",
    "old_value_summary": "varchar",
    "risk_tier": "enum_audit_logs_risk_tier",
    "summary": "varchar",
    "updated_at": "timestamp(3) with time zone",
    "user_id": "integer"
  },
  "blog_categories": {
    "approved_at": "timestamp(3) with time zone",
    "approved_by_id": "integer",
    "created_at": "timestamp(3) with time zone",
    "deleted_at": "timestamp(3) with time zone",
    "description": "varchar",
    "id": "serial",
    "name": "varchar",
    "rejection_reason": "varchar",
    "review_checklist_complete": "boolean",
    "review_summary": "varchar",
    "slug": "varchar",
    "submitted_at": "timestamp(3) with time zone",
    "submitted_by_id": "integer",
    "updated_at": "timestamp(3) with time zone",
    "workflow_status": "enum_blog_categories_workflow_status"
  },
  "blog_posts": {
    "_status": "enum_blog_posts_status",
    "approved_at": "timestamp(3) with time zone",
    "approved_by_id": "integer",
    "body": "jsonb",
    "category_id": "integer",
    "cover_image_id": "integer",
    "created_at": "timestamp(3) with time zone",
    "created_by_id": "integer",
    "deleted_at": "timestamp(3) with time zone",
    "excerpt": "varchar",
    "id": "serial",
    "is_featured": "boolean",
    "locale": "enum_blog_posts_locale",
    "meta_description": "varchar",
    "meta_image_id": "integer",
    "meta_title": "varchar",
    "published_at": "timestamp(3) with time zone",
    "reading_time_minutes": "numeric",
    "rejection_reason": "varchar",
    "resource_file_id": "integer",
    "resource_url": "varchar",
    "review_checklist_complete": "boolean",
    "review_summary": "varchar",
    "seo_canonical_url": "varchar",
    "seo_include_in_sitemap": "boolean",
    "seo_meta_description": "varchar",
    "seo_meta_title": "varchar",
    "seo_nofollow": "boolean",
    "seo_noindex": "boolean",
    "seo_og_description": "varchar",
    "seo_og_image_id": "integer",
    "seo_og_title": "varchar",
    "slug": "varchar",
    "submitted_at": "timestamp(3) with time zone",
    "submitted_by_id": "integer",
    "title": "varchar",
    "translation_group_id": "varchar",
    "updated_at": "timestamp(3) with time zone",
    "workflow_status": "enum_blog_posts_workflow_status"
  },
  "blog_posts_tags": {
    "_order": "integer",
    "_parent_id": "integer",
    "id": "varchar",
    "tag": "varchar"
  },
  "cmp_feat_vals": {
    "_order": "integer",
    "_parent_id": "varchar",
    "id": "varchar",
    "value": "varchar"
  },
  "cmp_features": {
    "_order": "integer",
    "_parent_id": "varchar",
    "id": "varchar",
    "label": "varchar"
  },
  "cmp_plan_cols": {
    "_order": "integer",
    "_parent_id": "varchar",
    "id": "varchar",
    "label": "varchar"
  },
  "cmp_table": {
    "_order": "integer",
    "_parent_id": "integer",
    "_path": "text",
    "anchor_id": "varchar",
    "background_color": "varchar",
    "block_name": "varchar",
    "custom_class_name": "varchar",
    "heading": "varchar",
    "heading_size": "enum_cmp_table_heading_size",
    "heading_tag": "enum_cmp_table_heading_tag",
    "id": "varchar",
    "is_hidden": "boolean",
    "section_label": "varchar",
    "size": "enum_cmp_table_size",
    "structural_key": "varchar",
    "text_align": "enum_cmp_table_text_align",
    "theme": "enum_cmp_table_theme",
    "visible_from": "timestamp(3) with time zone",
    "visible_until": "timestamp(3) with time zone"
  },
  "cta": {
    "_order": "integer",
    "_parent_id": "integer",
    "_path": "text",
    "anchor_id": "varchar",
    "background_color": "varchar",
    "block_name": "varchar",
    "body": "varchar",
    "button_href": "varchar",
    "button_label": "varchar",
    "custom_class_name": "varchar",
    "heading": "varchar",
    "heading_size": "enum_cta_heading_size",
    "heading_tag": "enum_cta_heading_tag",
    "id": "varchar",
    "is_hidden": "boolean",
    "section_label": "varchar",
    "size": "enum_cta_size",
    "structural_key": "varchar",
    "text_align": "enum_cta_text_align",
    "theme": "enum_cta_theme",
    "visible_from": "timestamp(3) with time zone",
    "visible_until": "timestamp(3) with time zone"
  },
  "divider": {
    "_order": "integer",
    "_parent_id": "integer",
    "_path": "text",
    "anchor_id": "varchar",
    "background_color": "varchar",
    "block_name": "varchar",
    "custom_class_name": "varchar",
    "heading_size": "enum_divider_heading_size",
    "heading_tag": "enum_divider_heading_tag",
    "id": "varchar",
    "is_hidden": "boolean",
    "label": "varchar",
    "section_label": "varchar",
    "size": "enum_divider_size",
    "structural_key": "varchar",
    "text_align": "enum_divider_text_align",
    "theme": "enum_divider_theme",
    "visible_from": "timestamp(3) with time zone",
    "visible_until": "timestamp(3) with time zone"
  },
  "dyn_list": {
    "_order": "integer",
    "_parent_id": "integer",
    "_path": "text",
    "anchor_id": "varchar",
    "background_color": "varchar",
    "block_name": "varchar",
    "custom_class_name": "varchar",
    "enable_pagination": "boolean",
    "filter_field": "varchar",
    "filter_value": "varchar",
    "heading": "varchar",
    "heading_size": "enum_dyn_list_heading_size",
    "heading_tag": "enum_dyn_list_heading_tag",
    "id": "varchar",
    "is_hidden": "boolean",
    "limit": "numeric",
    "section_label": "varchar",
    "size": "enum_dyn_list_size",
    "sort_direction": "dl_sort_dir",
    "sort_field": "varchar",
    "source": "dl_source",
    "structural_key": "varchar",
    "text_align": "enum_dyn_list_text_align",
    "theme": "enum_dyn_list_theme",
    "view_mode": "dl_view_mode",
    "visible_from": "timestamp(3) with time zone",
    "visible_until": "timestamp(3) with time zone"
  },
  "email_templates": {
    "body": "varchar",
    "button_label": "varchar",
    "button_url": "varchar",
    "created_at": "timestamp(3) with time zone",
    "heading": "varchar",
    "highlight_title": "varchar",
    "id": "serial",
    "name": "varchar",
    "preheader": "varchar",
    "reply_to": "varchar",
    "subject": "varchar",
    "updated_at": "timestamp(3) with time zone"
  },
  "exports": {
    "collection_slug": "varchar",
    "created_at": "timestamp(3) with time zone",
    "drafts": "enum_exports_drafts",
    "filename": "varchar",
    "filesize": "numeric",
    "focal_x": "numeric",
    "focal_y": "numeric",
    "format": "enum_exports_format",
    "height": "numeric",
    "id": "serial",
    "limit": "numeric",
    "mime_type": "varchar",
    "name": "varchar",
    "page": "numeric",
    "sort": "varchar",
    "sort_order": "enum_exports_sort_order",
    "thumbnail_u_r_l": "varchar",
    "updated_at": "timestamp(3) with time zone",
    "url": "varchar",
    "where": "jsonb",
    "width": "numeric"
  },
  "exports_texts": {
    "id": "serial",
    "order": "integer",
    "parent_id": "integer",
    "path": "varchar",
    "text": "varchar"
  },
  "faq_items": {
    "_order": "integer",
    "_parent_id": "varchar",
    "answer": "varchar",
    "id": "varchar",
    "question": "varchar"
  },
  "faq_sec": {
    "_order": "integer",
    "_parent_id": "integer",
    "_path": "text",
    "anchor_id": "varchar",
    "background_color": "varchar",
    "block_name": "varchar",
    "custom_class_name": "varchar",
    "heading": "varchar",
    "heading_size": "enum_faq_sec_heading_size",
    "heading_tag": "enum_faq_sec_heading_tag",
    "id": "varchar",
    "is_hidden": "boolean",
    "section_label": "varchar",
    "size": "enum_faq_sec_size",
    "structural_key": "varchar",
    "subheading": "varchar",
    "text_align": "enum_faq_sec_text_align",
    "theme": "enum_faq_sec_theme",
    "visible_from": "timestamp(3) with time zone",
    "visible_until": "timestamp(3) with time zone"
  },
  "feat_grid": {
    "_order": "integer",
    "_parent_id": "integer",
    "_path": "text",
    "anchor_id": "varchar",
    "background_color": "varchar",
    "block_name": "varchar",
    "columns": "enum_feat_grid_columns",
    "custom_class_name": "varchar",
    "heading": "varchar",
    "heading_size": "enum_feat_grid_heading_size",
    "heading_tag": "enum_feat_grid_heading_tag",
    "id": "varchar",
    "is_hidden": "boolean",
    "section_label": "varchar",
    "size": "enum_feat_grid_size",
    "structural_key": "varchar",
    "subheading": "varchar",
    "text_align": "enum_feat_grid_text_align",
    "theme": "enum_feat_grid_theme",
    "visible_from": "timestamp(3) with time zone",
    "visible_until": "timestamp(3) with time zone"
  },
  "feat_items": {
    "_order": "integer",
    "_parent_id": "varchar",
    "description": "varchar",
    "icon": "varchar",
    "id": "varchar",
    "link_href": "varchar",
    "link_label": "varchar",
    "title": "varchar"
  },
  "form_sec": {
    "_order": "integer",
    "_parent_id": "integer",
    "_path": "text",
    "anchor_id": "varchar",
    "background_color": "varchar",
    "block_name": "varchar",
    "custom_class_name": "varchar",
    "form_id": "integer",
    "heading": "varchar",
    "heading_size": "enum_form_sec_heading_size",
    "heading_tag": "enum_form_sec_heading_tag",
    "id": "varchar",
    "is_hidden": "boolean",
    "section_label": "varchar",
    "size": "enum_form_sec_size",
    "structural_key": "varchar",
    "subheading": "varchar",
    "success_message": "varchar",
    "text_align": "enum_form_sec_text_align",
    "theme": "enum_form_sec_theme",
    "visible_from": "timestamp(3) with time zone",
    "visible_until": "timestamp(3) with time zone"
  },
  "form_submissions": {
    "created_at": "timestamp(3) with time zone",
    "form_id": "integer",
    "form_type": "varchar",
    "id": "serial",
    "updated_at": "timestamp(3) with time zone"
  },
  "form_submissions_submission_data": {
    "_order": "integer",
    "_parent_id": "integer",
    "field": "varchar",
    "id": "varchar",
    "value": "varchar"
  },
  "forms": {
    "confirmation_message": "jsonb",
    "confirmation_type": "enum_forms_confirmation_type",
    "created_at": "timestamp(3) with time zone",
    "email_template_id": "integer",
    "id": "serial",
    "redirect_url": "varchar",
    "submit_button_label": "varchar",
    "template_key": "template_key",
    "title": "varchar",
    "updated_at": "timestamp(3) with time zone"
  },
  "forms_blocks_checkbox": {
    "_order": "integer",
    "_parent_id": "integer",
    "_path": "text",
    "block_name": "varchar",
    "default_value": "boolean",
    "id": "varchar",
    "label": "varchar",
    "name": "varchar",
    "required": "boolean",
    "width": "numeric"
  },
  "forms_blocks_email": {
    "_order": "integer",
    "_parent_id": "integer",
    "_path": "text",
    "block_name": "varchar",
    "id": "varchar",
    "label": "varchar",
    "name": "varchar",
    "required": "boolean",
    "width": "numeric"
  },
  "forms_blocks_message": {
    "_order": "integer",
    "_parent_id": "integer",
    "_path": "text",
    "block_name": "varchar",
    "id": "varchar",
    "message": "jsonb"
  },
  "forms_blocks_number": {
    "_order": "integer",
    "_parent_id": "integer",
    "_path": "text",
    "block_name": "varchar",
    "default_value": "numeric",
    "id": "varchar",
    "label": "varchar",
    "name": "varchar",
    "required": "boolean",
    "width": "numeric"
  },
  "forms_blocks_select": {
    "_order": "integer",
    "_parent_id": "integer",
    "_path": "text",
    "block_name": "varchar",
    "default_value": "varchar",
    "id": "varchar",
    "label": "varchar",
    "name": "varchar",
    "placeholder": "varchar",
    "required": "boolean",
    "width": "numeric"
  },
  "forms_blocks_select_options": {
    "_order": "integer",
    "_parent_id": "varchar",
    "id": "varchar",
    "label": "varchar",
    "value": "varchar"
  },
  "forms_blocks_text": {
    "_order": "integer",
    "_parent_id": "integer",
    "_path": "text",
    "block_name": "varchar",
    "default_value": "varchar",
    "id": "varchar",
    "label": "varchar",
    "name": "varchar",
    "required": "boolean",
    "width": "numeric"
  },
  "forms_blocks_textarea": {
    "_order": "integer",
    "_parent_id": "integer",
    "_path": "text",
    "block_name": "varchar",
    "default_value": "varchar",
    "id": "varchar",
    "label": "varchar",
    "name": "varchar",
    "required": "boolean",
    "width": "numeric"
  },
  "forms_emails": {
    "_order": "integer",
    "_parent_id": "integer",
    "bcc": "varchar",
    "cc": "varchar",
    "email_from": "varchar",
    "email_to": "varchar",
    "id": "varchar",
    "message": "jsonb",
    "reply_to": "varchar",
    "subject": "varchar"
  },
  "hero": {
    "_order": "integer",
    "_parent_id": "integer",
    "_path": "text",
    "anchor_id": "varchar",
    "background_color": "varchar",
    "background_image_id": "integer",
    "background_video": "varchar",
    "block_name": "varchar",
    "custom_class_name": "varchar",
    "eyebrow": "varchar",
    "heading": "varchar",
    "heading_size": "enum_hero_heading_size",
    "heading_tag": "enum_hero_heading_tag",
    "id": "varchar",
    "is_hidden": "boolean",
    "min_height": "numeric",
    "primary_cta_href": "varchar",
    "primary_cta_label": "varchar",
    "secondary_cta_href": "varchar",
    "secondary_cta_label": "varchar",
    "section_label": "varchar",
    "size": "enum_hero_size",
    "structural_key": "varchar",
    "subheading": "varchar",
    "text_align": "enum_hero_text_align",
    "text_alignment": "enum_hero_text_alignment",
    "theme": "enum_hero_theme",
    "visible_from": "timestamp(3) with time zone",
    "visible_until": "timestamp(3) with time zone"
  },
  "img_sec": {
    "_order": "integer",
    "_parent_id": "integer",
    "_path": "text",
    "anchor_id": "varchar",
    "aspect_ratio": "enum_img_sec_aspect_ratio",
    "background_color": "varchar",
    "block_name": "varchar",
    "caption": "varchar",
    "custom_class_name": "varchar",
    "display_mode": "enum_img_sec_display_mode",
    "grid_columns": "numeric",
    "heading": "varchar",
    "heading_size": "enum_img_sec_heading_size",
    "heading_tag": "enum_img_sec_heading_tag",
    "id": "varchar",
    "is_hidden": "boolean",
    "section_label": "varchar",
    "size": "enum_img_sec_size",
    "structural_key": "varchar",
    "text_align": "enum_img_sec_text_align",
    "theme": "enum_img_sec_theme",
    "visible_from": "timestamp(3) with time zone",
    "visible_until": "timestamp(3) with time zone"
  },
  "img_sec_images": {
    "_order": "integer",
    "_parent_id": "varchar",
    "alt_override": "varchar",
    "caption": "varchar",
    "id": "varchar",
    "image_id": "integer",
    "link_href": "varchar"
  },
  "imports": {
    "collection_slug": "varchar",
    "created_at": "timestamp(3) with time zone",
    "filename": "varchar",
    "filesize": "numeric",
    "focal_x": "numeric",
    "focal_y": "numeric",
    "height": "numeric",
    "id": "serial",
    "import_mode": "enum_imports_import_mode",
    "match_field": "varchar",
    "mime_type": "varchar",
    "status": "enum_imports_status",
    "summary_imported": "numeric",
    "summary_issue_details": "jsonb",
    "summary_issues": "numeric",
    "summary_total": "numeric",
    "summary_updated": "numeric",
    "thumbnail_u_r_l": "varchar",
    "updated_at": "timestamp(3) with time zone",
    "url": "varchar",
    "width": "numeric"
  },
  "logo_band": {
    "_order": "integer",
    "_parent_id": "integer",
    "_path": "text",
    "anchor_id": "varchar",
    "background_color": "varchar",
    "block_name": "varchar",
    "custom_class_name": "varchar",
    "display_mode": "enum_logo_band_display_mode",
    "heading": "varchar",
    "heading_size": "enum_logo_band_heading_size",
    "heading_tag": "enum_logo_band_heading_tag",
    "id": "varchar",
    "is_hidden": "boolean",
    "logo_height": "numeric",
    "section_label": "varchar",
    "size": "enum_logo_band_size",
    "structural_key": "varchar",
    "text_align": "enum_logo_band_text_align",
    "theme": "enum_logo_band_theme",
    "visible_from": "timestamp(3) with time zone",
    "visible_until": "timestamp(3) with time zone"
  },
  "logos": {
    "_status": "enum_logos_status",
    "approved_at": "timestamp(3) with time zone",
    "approved_by_id": "integer",
    "created_at": "timestamp(3) with time zone",
    "deleted_at": "timestamp(3) with time zone",
    "id": "serial",
    "image_id": "integer",
    "name": "varchar",
    "order": "numeric",
    "rejection_reason": "varchar",
    "review_checklist_complete": "boolean",
    "review_summary": "varchar",
    "submitted_at": "timestamp(3) with time zone",
    "submitted_by_id": "integer",
    "updated_at": "timestamp(3) with time zone",
    "url": "varchar",
    "workflow_status": "enum_logos_workflow_status"
  },
  "media": {
    "alt": "varchar",
    "attribution_text": "varchar",
    "caption": "varchar",
    "created_at": "timestamp(3) with time zone",
    "filename": "varchar",
    "filesize": "numeric",
    "focal_x": "numeric",
    "focal_y": "numeric",
    "folder_id": "integer",
    "height": "numeric",
    "id": "serial",
    "license_expires_at": "timestamp(3) with time zone",
    "license_source": "varchar",
    "media_qa_status": "enum_media_media_qa_status",
    "mime_type": "varchar",
    "requires_attribution": "boolean",
    "sizes_card_filename": "varchar",
    "sizes_card_filesize": "numeric",
    "sizes_card_height": "numeric",
    "sizes_card_mime_type": "varchar",
    "sizes_card_url": "varchar",
    "sizes_card_width": "numeric",
    "sizes_hero_filename": "varchar",
    "sizes_hero_filesize": "numeric",
    "sizes_hero_height": "numeric",
    "sizes_hero_mime_type": "varchar",
    "sizes_hero_url": "varchar",
    "sizes_hero_width": "numeric",
    "sizes_thumbnail_filename": "varchar",
    "sizes_thumbnail_filesize": "numeric",
    "sizes_thumbnail_height": "numeric",
    "sizes_thumbnail_mime_type": "varchar",
    "sizes_thumbnail_url": "varchar",
    "sizes_thumbnail_width": "numeric",
    "thumbnail_u_r_l": "varchar",
    "updated_at": "timestamp(3) with time zone",
    "url": "varchar",
    "usage_approved_at": "timestamp(3) with time zone",
    "usage_approved_by_id": "integer",
    "usage_scope": "enum_media_usage_scope",
    "width": "numeric"
  },
  "nav_children": {
    "_order": "integer",
    "_parent_id": "varchar",
    "href": "varchar",
    "id": "varchar",
    "label": "varchar"
  },
  "org_about_profiles": {
    "_status": "enum_org_about_profiles_status",
    "affiliation": "varchar",
    "approved_at": "timestamp(3) with time zone",
    "approved_by_id": "integer",
    "category": "enum_org_about_profiles_category",
    "created_at": "timestamp(3) with time zone",
    "created_by_id": "integer",
    "detail_content": "jsonb",
    "display_order": "numeric",
    "external_link": "varchar",
    "id": "serial",
    "name": "varchar",
    "profile_image_id": "integer",
    "rejection_reason": "varchar",
    "review_checklist_complete": "boolean",
    "review_summary": "varchar",
    "role_title": "varchar",
    "seo_canonical_url": "varchar",
    "seo_include_in_sitemap": "boolean",
    "seo_meta_description": "varchar",
    "seo_meta_title": "varchar",
    "seo_nofollow": "boolean",
    "seo_noindex": "boolean",
    "seo_og_description": "varchar",
    "seo_og_image_id": "integer",
    "seo_og_title": "varchar",
    "short_bio": "varchar",
    "slug": "varchar",
    "submitted_at": "timestamp(3) with time zone",
    "submitted_by_id": "integer",
    "updated_at": "timestamp(3) with time zone",
    "workflow_status": "enum_org_about_profiles_workflow_status"
  },
  "org_about_profiles_additional_images": {
    "_order": "integer",
    "_parent_id": "integer",
    "id": "varchar",
    "image_id": "integer"
  },
  "org_events": {
    "_status": "enum_org_events_status",
    "approved_at": "timestamp(3) with time zone",
    "approved_by_id": "integer",
    "created_at": "timestamp(3) with time zone",
    "created_by_id": "integer",
    "description": "jsonb",
    "display_priority": "numeric",
    "display_window_end": "timestamp(3) with time zone",
    "display_window_start": "timestamp(3) with time zone",
    "end_date": "timestamp(3) with time zone",
    "end_time": "varchar",
    "event_status": "enum_org_events_event_status",
    "event_timezone": "varchar",
    "event_type": "enum_org_events_event_type",
    "hero_image_id": "integer",
    "id": "serial",
    "is_featured": "boolean",
    "location": "varchar",
    "max_registrations": "numeric",
    "payment_instructions": "jsonb",
    "payment_reference_format": "varchar",
    "payment_required": "boolean",
    "registration_closes_at": "timestamp(3) with time zone",
    "registration_instructions": "jsonb",
    "registration_opens_at": "timestamp(3) with time zone",
    "registration_required": "boolean",
    "rejection_reason": "varchar",
    "review_checklist_complete": "boolean",
    "review_summary": "varchar",
    "seo_canonical_url": "varchar",
    "seo_include_in_sitemap": "boolean",
    "seo_meta_description": "varchar",
    "seo_meta_title": "varchar",
    "seo_nofollow": "boolean",
    "seo_noindex": "boolean",
    "seo_og_description": "varchar",
    "seo_og_image_id": "integer",
    "seo_og_title": "varchar",
    "short_summary": "varchar",
    "slug": "varchar",
    "start_date": "timestamp(3) with time zone",
    "start_time": "varchar",
    "submitted_at": "timestamp(3) with time zone",
    "submitted_by_id": "integer",
    "title": "varchar",
    "updated_at": "timestamp(3) with time zone",
    "venmo_qr_code_id": "integer",
    "venue": "varchar",
    "workflow_status": "enum_org_events_workflow_status",
    "zelle_qr_code_id": "integer"
  },
  "org_events_external_links": {
    "_order": "integer",
    "_parent_id": "integer",
    "id": "varchar",
    "label": "varchar",
    "url": "varchar"
  },
  "org_events_media_gallery": {
    "_order": "integer",
    "_parent_id": "integer",
    "id": "varchar",
    "image_id": "integer"
  },
  "org_events_rels": {
    "id": "serial",
    "order": "integer",
    "org_events_id": "integer",
    "org_learning_id": "integer",
    "org_spotlight_id": "integer",
    "parent_id": "integer",
    "path": "varchar"
  },
  "org_home_features": {
    "_status": "enum_org_home_features_status",
    "created_at": "timestamp(3) with time zone",
    "events_placeholder": "varchar",
    "id": "serial",
    "learning_placeholder": "varchar",
    "spotlight_placeholder": "varchar",
    "updated_at": "timestamp(3) with time zone"
  },
  "org_home_features_home_section_order": {
    "id": "serial",
    "order": "integer",
    "parent_id": "integer",
    "value": "enum_org_home_features_home_section_order"
  },
  "org_home_features_rels": {
    "id": "serial",
    "order": "integer",
    "org_events_id": "integer",
    "org_learning_id": "integer",
    "org_spotlight_id": "integer",
    "parent_id": "integer",
    "path": "varchar"
  },
  "org_learning": {
    "_status": "enum_org_learning_status",
    "approved_at": "timestamp(3) with time zone",
    "approved_by_id": "integer",
    "author": "varchar",
    "category": "enum_org_learning_category",
    "created_at": "timestamp(3) with time zone",
    "created_by_id": "integer",
    "detail_content": "jsonb",
    "display_order": "numeric",
    "external_reference_link": "varchar",
    "id": "serial",
    "is_featured": "boolean",
    "rejection_reason": "varchar",
    "related_event_id": "integer",
    "related_spotlight_id": "integer",
    "review_checklist_complete": "boolean",
    "review_summary": "varchar",
    "seo_canonical_url": "varchar",
    "seo_include_in_sitemap": "boolean",
    "seo_meta_description": "varchar",
    "seo_meta_title": "varchar",
    "seo_nofollow": "boolean",
    "seo_noindex": "boolean",
    "seo_og_description": "varchar",
    "seo_og_image_id": "integer",
    "seo_og_title": "varchar",
    "short_summary": "varchar",
    "slug": "varchar",
    "submitted_at": "timestamp(3) with time zone",
    "submitted_by_id": "integer",
    "thumbnail_id": "integer",
    "title": "varchar",
    "updated_at": "timestamp(3) with time zone",
    "workflow_status": "enum_org_learning_workflow_status"
  },
  "org_sponsors": {
    "_status": "enum_org_sponsors_status",
    "created_at": "timestamp(3) with time zone",
    "donation_instructions": "jsonb",
    "featured_supporter_text": "jsonb",
    "id": "serial",
    "page_title": "varchar",
    "payment_instructions_content": "jsonb",
    "sponsor_acknowledgment_content": "jsonb",
    "support_contact_path": "varchar",
    "support_summary": "jsonb",
    "updated_at": "timestamp(3) with time zone",
    "venmo_qr_code_id": "integer",
    "zelle_qr_code_id": "integer"
  },
  "org_sponsors_display_order": {
    "id": "serial",
    "order": "integer",
    "parent_id": "integer",
    "value": "enum_org_sponsors_display_order"
  },
  "org_sponsors_sponsor_logos": {
    "_order": "integer",
    "_parent_id": "integer",
    "id": "varchar",
    "label": "varchar",
    "logo_id": "integer"
  },
  "org_sponsors_support_faq": {
    "_order": "integer",
    "_parent_id": "integer",
    "answer": "varchar",
    "id": "varchar",
    "question": "varchar"
  },
  "org_spotlight": {
    "_status": "enum_org_spotlight_status",
    "affiliation": "varchar",
    "approved_at": "timestamp(3) with time zone",
    "approved_by_id": "integer",
    "category": "enum_org_spotlight_category",
    "created_at": "timestamp(3) with time zone",
    "created_by_id": "integer",
    "detail_content": "jsonb",
    "display_order": "numeric",
    "external_link": "varchar",
    "id": "serial",
    "is_featured": "boolean",
    "name": "varchar",
    "rejection_reason": "varchar",
    "review_checklist_complete": "boolean",
    "review_summary": "varchar",
    "role_title": "varchar",
    "seo_canonical_url": "varchar",
    "seo_include_in_sitemap": "boolean",
    "seo_meta_description": "varchar",
    "seo_meta_title": "varchar",
    "seo_nofollow": "boolean",
    "seo_noindex": "boolean",
    "seo_og_description": "varchar",
    "seo_og_image_id": "integer",
    "seo_og_title": "varchar",
    "short_summary": "varchar",
    "slug": "varchar",
    "submitted_at": "timestamp(3) with time zone",
    "submitted_by_id": "integer",
    "thumbnail_image_id": "integer",
    "updated_at": "timestamp(3) with time zone",
    "workflow_status": "enum_org_spotlight_workflow_status"
  },
  "org_spotlight_additional_images": {
    "_order": "integer",
    "_parent_id": "integer",
    "id": "varchar",
    "image_id": "integer"
  },
  "org_spotlight_rels": {
    "id": "serial",
    "order": "integer",
    "org_events_id": "integer",
    "parent_id": "integer",
    "path": "varchar"
  },
  "page_drafts": {
    "approved_at": "timestamp(3) with time zone",
    "approved_by_id": "integer",
    "created_at": "timestamp(3) with time zone",
    "created_by_id": "integer",
    "deleted_at": "timestamp(3) with time zone",
    "editor_notes": "varchar",
    "id": "serial",
    "rejection_reason": "varchar",
    "review_checklist_complete": "boolean",
    "review_summary": "varchar",
    "sections_locked": "boolean",
    "seo_canonical_url": "varchar",
    "seo_include_in_sitemap": "boolean",
    "seo_meta_description": "varchar",
    "seo_meta_title": "varchar",
    "seo_nofollow": "boolean",
    "seo_noindex": "boolean",
    "seo_og_description": "varchar",
    "seo_og_image_id": "integer",
    "seo_og_title": "varchar",
    "source_page_id": "integer",
    "source_playground_id": "integer",
    "source_preset_id": "integer",
    "source_type": "enum_page_drafts_source_type",
    "submitted_at": "timestamp(3) with time zone",
    "submitted_by_id": "integer",
    "target_slug": "varchar",
    "title": "varchar",
    "updated_at": "timestamp(3) with time zone",
    "workflow_status": "enum_page_drafts_workflow_status"
  },
  "page_playgrounds": {
    "created_at": "timestamp(3) with time zone",
    "created_by_id": "integer",
    "deleted_at": "timestamp(3) with time zone",
    "id": "serial",
    "name": "varchar",
    "notes": "varchar",
    "updated_at": "timestamp(3) with time zone",
    "visibility": "enum_page_playgrounds_visibility"
  },
  "page_presets": {
    "category": "enum_page_presets_category",
    "created_at": "timestamp(3) with time zone",
    "created_by_id": "integer",
    "created_from_snapshot_at": "timestamp(3) with time zone",
    "deleted_at": "timestamp(3) with time zone",
    "description": "varchar",
    "id": "serial",
    "name": "varchar",
    "source_draft_id": "integer",
    "source_live_page_id": "integer",
    "source_playground_id": "integer",
    "source_type": "enum_page_presets_source_type",
    "structure_mode": "enum_page_presets_structure_mode",
    "thumbnail_id": "integer",
    "updated_at": "timestamp(3) with time zone"
  },
  "page_presets_tags": {
    "_order": "integer",
    "_parent_id": "integer",
    "id": "varchar",
    "tag": "varchar"
  },
  "payload_folders": {
    "created_at": "timestamp(3) with time zone",
    "folder_id": "integer",
    "id": "serial",
    "name": "varchar",
    "updated_at": "timestamp(3) with time zone"
  },
  "payload_folders_folder_type": {
    "id": "serial",
    "order": "integer",
    "parent_id": "integer",
    "value": "enum_payload_folders_folder_type"
  },
  "payload_jobs": {
    "completed_at": "timestamp(3) with time zone",
    "created_at": "timestamp(3) with time zone",
    "error": "jsonb",
    "has_error": "boolean",
    "id": "serial",
    "input": "jsonb",
    "processing": "boolean",
    "queue": "varchar",
    "task_slug": "enum_payload_jobs_task_slug",
    "total_tried": "numeric",
    "updated_at": "timestamp(3) with time zone",
    "wait_until": "timestamp(3) with time zone"
  },
  "payload_jobs_log": {
    "_order": "integer",
    "_parent_id": "integer",
    "completed_at": "timestamp(3) with time zone",
    "error": "jsonb",
    "executed_at": "timestamp(3) with time zone",
    "id": "varchar",
    "input": "jsonb",
    "output": "jsonb",
    "state": "enum_payload_jobs_log_state",
    "task_i_d": "varchar",
    "task_slug": "enum_payload_jobs_log_task_slug"
  },
  "payload_kv": {
    "data": "jsonb",
    "id": "serial",
    "key": "varchar"
  },
  "payload_locked_documents": {
    "created_at": "timestamp(3) with time zone",
    "global_slug": "varchar",
    "id": "serial",
    "updated_at": "timestamp(3) with time zone"
  },
  "payload_locked_documents_rels": {
    "audit_logs_id": "integer",
    "blog_categories_id": "integer",
    "blog_posts_id": "integer",
    "email_templates_id": "integer",
    "form_submissions_id": "integer",
    "forms_id": "integer",
    "id": "serial",
    "logos_id": "integer",
    "media_id": "integer",
    "order": "integer",
    "org_about_profiles_id": "integer",
    "org_events_id": "integer",
    "org_learning_id": "integer",
    "org_spotlight_id": "integer",
    "page_drafts_id": "integer",
    "page_playgrounds_id": "integer",
    "page_presets_id": "integer",
    "parent_id": "integer",
    "path": "varchar",
    "payload_folders_id": "integer",
    "redirect_rules_id": "integer",
    "reuse_sec_id": "integer",
    "search_id": "integer",
    "service_items_id": "integer",
    "site_pages_id": "integer",
    "team_members_id": "integer",
    "testimonials_id": "integer",
    "users_id": "integer"
  },
  "payload_migrations": {
    "batch": "numeric",
    "created_at": "timestamp(3) with time zone",
    "id": "serial",
    "name": "varchar",
    "updated_at": "timestamp(3) with time zone"
  },
  "payload_preferences": {
    "created_at": "timestamp(3) with time zone",
    "id": "serial",
    "key": "varchar",
    "updated_at": "timestamp(3) with time zone",
    "value": "jsonb"
  },
  "payload_preferences_rels": {
    "id": "serial",
    "order": "integer",
    "parent_id": "integer",
    "path": "varchar",
    "users_id": "integer"
  },
  "payload_query_presets": {
    "access_delete_constraint": "enum_payload_query_presets_access_delete_constraint",
    "access_read_constraint": "enum_payload_query_presets_access_read_constraint",
    "access_update_constraint": "enum_payload_query_presets_access_update_constraint",
    "columns": "jsonb",
    "created_at": "timestamp(3) with time zone",
    "group_by": "varchar",
    "id": "serial",
    "is_shared": "boolean",
    "is_temp": "boolean",
    "related_collection": "enum_payload_query_presets_related_collection",
    "title": "varchar",
    "updated_at": "timestamp(3) with time zone",
    "where": "jsonb"
  },
  "payload_query_presets_rels": {
    "id": "serial",
    "order": "integer",
    "parent_id": "integer",
    "path": "varchar",
    "users_id": "integer"
  },
  "privacy_note": {
    "_order": "integer",
    "_parent_id": "integer",
    "_path": "text",
    "anchor_id": "varchar",
    "background_color": "varchar",
    "block_name": "varchar",
    "custom_class_name": "varchar",
    "heading_size": "enum_privacy_note_heading_size",
    "heading_tag": "enum_privacy_note_heading_tag",
    "id": "varchar",
    "is_hidden": "boolean",
    "label": "varchar",
    "policy_link_href": "varchar",
    "policy_link_label": "varchar",
    "section_label": "varchar",
    "size": "enum_privacy_note_size",
    "structural_key": "varchar",
    "text_align": "enum_privacy_note_text_align",
    "theme": "enum_privacy_note_theme",
    "visible_from": "timestamp(3) with time zone",
    "visible_until": "timestamp(3) with time zone"
  },
  "quote_sec": {
    "_order": "integer",
    "_parent_id": "integer",
    "_path": "text",
    "anchor_id": "varchar",
    "attribution": "varchar",
    "attribution_role": "varchar",
    "background_color": "varchar",
    "block_name": "varchar",
    "custom_class_name": "varchar",
    "heading_size": "enum_quote_sec_heading_size",
    "heading_tag": "enum_quote_sec_heading_tag",
    "id": "varchar",
    "is_hidden": "boolean",
    "photo_id": "integer",
    "quote": "varchar",
    "section_label": "varchar",
    "size": "enum_quote_sec_size",
    "structural_key": "varchar",
    "style": "enum_quote_sec_style",
    "text_align": "enum_quote_sec_text_align",
    "theme": "enum_quote_sec_theme",
    "visible_from": "timestamp(3) with time zone",
    "visible_until": "timestamp(3) with time zone"
  },
  "redirect_rules": {
    "created_at": "timestamp(3) with time zone",
    "deleted_at": "timestamp(3) with time zone",
    "enabled": "boolean",
    "from_path": "varchar",
    "id": "serial",
    "is_permanent": "boolean",
    "to_path": "varchar",
    "updated_at": "timestamp(3) with time zone"
  },
  "reuse_sec": {
    "approved_at": "timestamp(3) with time zone",
    "approved_by_id": "integer",
    "created_at": "timestamp(3) with time zone",
    "deleted_at": "timestamp(3) with time zone",
    "id": "serial",
    "is_deprecated": "boolean",
    "library_category": "enum_reuse_sec_library_category",
    "library_change_summary": "varchar",
    "library_version": "numeric",
    "locale": "enum_reuse_sec_locale",
    "rejection_reason": "varchar",
    "review_checklist_complete": "boolean",
    "review_summary": "varchar",
    "slug": "varchar",
    "submitted_at": "timestamp(3) with time zone",
    "submitted_by_id": "integer",
    "title": "varchar",
    "translation_group_id": "varchar",
    "updated_at": "timestamp(3) with time zone",
    "workflow_status": "enum_reuse_sec_workflow_status"
  },
  "reuse_sec_ref": {
    "_order": "integer",
    "_parent_id": "integer",
    "_path": "text",
    "anchor_id": "varchar",
    "background_color": "varchar",
    "block_name": "varchar",
    "custom_class_name": "varchar",
    "heading_size": "enum_reuse_sec_ref_heading_size",
    "heading_tag": "enum_reuse_sec_ref_heading_tag",
    "id": "varchar",
    "is_hidden": "boolean",
    "override_heading": "varchar",
    "reusable_section_id": "integer",
    "section_label": "varchar",
    "size": "enum_reuse_sec_ref_size",
    "structural_key": "varchar",
    "text_align": "enum_reuse_sec_ref_text_align",
    "theme": "enum_reuse_sec_ref_theme",
    "visible_from": "timestamp(3) with time zone",
    "visible_until": "timestamp(3) with time zone"
  },
  "richtext": {
    "_order": "integer",
    "_parent_id": "integer",
    "_path": "text",
    "anchor_id": "varchar",
    "background_color": "varchar",
    "block_name": "varchar",
    "content": "jsonb",
    "custom_class_name": "varchar",
    "heading": "varchar",
    "heading_size": "enum_richtext_heading_size",
    "heading_tag": "enum_richtext_heading_tag",
    "id": "varchar",
    "is_hidden": "boolean",
    "section_label": "varchar",
    "size": "enum_richtext_size",
    "structural_key": "varchar",
    "text_align": "enum_richtext_text_align",
    "theme": "enum_richtext_theme",
    "visible_from": "timestamp(3) with time zone",
    "visible_until": "timestamp(3) with time zone"
  },
  "search": {
    "created_at": "timestamp(3) with time zone",
    "id": "serial",
    "priority": "numeric",
    "title": "varchar",
    "updated_at": "timestamp(3) with time zone"
  },
  "search_rels": {
    "blog_posts_id": "integer",
    "id": "serial",
    "order": "integer",
    "parent_id": "integer",
    "path": "varchar",
    "service_items_id": "integer",
    "site_pages_id": "integer",
    "testimonials_id": "integer"
  },
  "service_items": {
    "_status": "enum_service_items_status",
    "approved_at": "timestamp(3) with time zone",
    "approved_by_id": "integer",
    "body": "jsonb",
    "created_at": "timestamp(3) with time zone",
    "created_by_id": "integer",
    "currency": "enum_service_items_currency",
    "deleted_at": "timestamp(3) with time zone",
    "hero_image_id": "integer",
    "id": "serial",
    "is_featured": "boolean",
    "locale": "enum_service_items_locale",
    "meta_description": "varchar",
    "meta_image_id": "integer",
    "meta_title": "varchar",
    "price_from": "numeric",
    "rejection_reason": "varchar",
    "review_checklist_complete": "boolean",
    "review_summary": "varchar",
    "seo_canonical_url": "varchar",
    "seo_include_in_sitemap": "boolean",
    "seo_meta_description": "varchar",
    "seo_meta_title": "varchar",
    "seo_nofollow": "boolean",
    "seo_noindex": "boolean",
    "seo_og_description": "varchar",
    "seo_og_image_id": "integer",
    "seo_og_title": "varchar",
    "slug": "varchar",
    "submitted_at": "timestamp(3) with time zone",
    "submitted_by_id": "integer",
    "summary": "varchar",
    "title": "varchar",
    "translation_group_id": "varchar",
    "updated_at": "timestamp(3) with time zone",
    "workflow_status": "enum_service_items_workflow_status"
  },
  "service_items_tags": {
    "_order": "integer",
    "_parent_id": "integer",
    "id": "varchar",
    "tag": "varchar"
  },
  "simple_table": {
    "_order": "integer",
    "_parent_id": "integer",
    "_path": "text",
    "anchor_id": "varchar",
    "background_color": "varchar",
    "block_name": "varchar",
    "custom_class_name": "varchar",
    "heading": "varchar",
    "heading_size": "enum_simple_table_heading_size",
    "heading_tag": "enum_simple_table_heading_tag",
    "id": "varchar",
    "is_hidden": "boolean",
    "section_label": "varchar",
    "size": "enum_simple_table_size",
    "structural_key": "varchar",
    "text_align": "enum_simple_table_text_align",
    "theme": "enum_simple_table_theme",
    "visible_from": "timestamp(3) with time zone",
    "visible_until": "timestamp(3) with time zone"
  },
  "site_pages": {
    "approved_at": "timestamp(3) with time zone",
    "approved_by_id": "integer",
    "created_at": "timestamp(3) with time zone",
    "created_by_id": "integer",
    "custom_head_scripts": "varchar",
    "deleted_at": "timestamp(3) with time zone",
    "hide_footer": "boolean",
    "hide_navbar": "boolean",
    "id": "serial",
    "is_active": "boolean",
    "meta_description": "varchar",
    "meta_image_id": "integer",
    "meta_title": "varchar",
    "page_background_color": "varchar",
    "parent_id": "integer",
    "preset_content": "jsonb",
    "preset_key": "enum_site_pages_preset_key",
    "preview_diff_summary": "jsonb",
    "publish_quality_level": "enum_site_pages_publish_quality_level",
    "publish_quality_score": "numeric",
    "rejection_reason": "varchar",
    "review_checklist_complete": "boolean",
    "review_summary": "varchar",
    "seo_canonical_url": "varchar",
    "seo_include_in_sitemap": "boolean",
    "seo_meta_description": "varchar",
    "seo_meta_title": "varchar",
    "seo_nofollow": "boolean",
    "seo_noindex": "boolean",
    "seo_og_description": "varchar",
    "seo_og_image_id": "integer",
    "seo_og_title": "varchar",
    "slug": "varchar",
    "submitted_at": "timestamp(3) with time zone",
    "submitted_by_id": "integer",
    "title": "varchar",
    "updated_at": "timestamp(3) with time zone",
    "workflow_status": "enum_site_pages_workflow_status"
  },
  "site_pages_breadcrumbs": {
    "_order": "integer",
    "_parent_id": "integer",
    "doc_id": "integer",
    "id": "varchar",
    "label": "varchar",
    "url": "varchar"
  },
  "site_pages_rels": {
    "id": "serial",
    "logos_id": "integer",
    "order": "integer",
    "parent_id": "integer",
    "path": "varchar",
    "team_members_id": "integer"
  },
  "site_settings": {
    "_status": "enum_site_settings_status",
    "analytics_id": "varchar",
    "announcement_banner_background_color": "varchar",
    "announcement_banner_enabled": "boolean",
    "announcement_banner_link_href": "varchar",
    "announcement_banner_link_label": "varchar",
    "announcement_banner_text": "varchar",
    "announcement_banner_text_color": "varchar",
    "brand_tagline": "varchar",
    "contact_email": "varchar",
    "content_routing_guide_page_url": "varchar",
    "content_routing_guide_pdf_url": "varchar",
    "content_routing_guide_title": "varchar",
    "content_routing_privacy_policy_url": "varchar",
    "content_routing_workflow_notify_email": "varchar",
    "cookie_banner_accept_label": "varchar",
    "cookie_banner_decline_label": "varchar",
    "cookie_banner_message": "varchar",
    "cookie_banner_privacy_href": "varchar",
    "cookie_banner_privacy_label": "varchar",
    "copyright_text": "varchar",
    "core_preset_content_about": "jsonb",
    "core_preset_content_contact": "jsonb",
    "core_preset_content_home": "jsonb",
    "core_preset_content_pricing": "jsonb",
    "core_preset_content_services": "jsonb",
    "created_at": "timestamp(3) with time zone",
    "default_seo_canonical_url": "varchar",
    "default_seo_include_in_sitemap": "boolean",
    "default_seo_meta_description": "varchar",
    "default_seo_meta_title": "varchar",
    "default_seo_nofollow": "boolean",
    "default_seo_noindex": "boolean",
    "default_seo_og_description": "varchar",
    "default_seo_og_image_id": "integer",
    "default_seo_og_title": "varchar",
    "email_defaults_brand_name": "varchar",
    "email_defaults_guide_body": "varchar",
    "email_defaults_guide_button_label": "varchar",
    "email_defaults_guide_heading": "varchar",
    "email_defaults_guide_subject": "varchar",
    "email_defaults_inquiry_ack_body": "varchar",
    "email_defaults_inquiry_ack_heading": "varchar",
    "email_defaults_inquiry_ack_subject": "varchar",
    "email_defaults_inquiry_notification_subject": "varchar",
    "footer_legal_href": "varchar",
    "footer_legal_label": "varchar",
    "guide_form_email_placeholder": "varchar",
    "guide_form_footer_text": "varchar",
    "guide_form_name_placeholder": "varchar",
    "guide_form_privacy_href": "varchar",
    "guide_form_privacy_label": "varchar",
    "guide_form_submit_label": "varchar",
    "guide_form_submitting_label": "varchar",
    "guide_form_success_body": "varchar",
    "guide_form_success_heading": "varchar",
    "id": "serial",
    "inquiry_form_challenge_placeholder": "varchar",
    "inquiry_form_company_placeholder": "varchar",
    "inquiry_form_consent_text": "varchar",
    "inquiry_form_email_placeholder": "varchar",
    "inquiry_form_name_placeholder": "varchar",
    "inquiry_form_privacy_href": "varchar",
    "inquiry_form_privacy_label": "varchar",
    "inquiry_form_submit_label": "varchar",
    "inquiry_form_submitting_label": "varchar",
    "inquiry_form_success_body": "varchar",
    "inquiry_form_success_heading": "varchar",
    "json_ld_organization_email": "varchar",
    "json_ld_organization_name": "varchar",
    "json_ld_organization_url": "varchar",
    "logo_image_id": "integer",
    "logo_width": "numeric",
    "meta_description": "varchar",
    "meta_image_id": "integer",
    "meta_title": "varchar",
    "not_found_page_body": "varchar",
    "not_found_page_button_href": "varchar",
    "not_found_page_button_label": "varchar",
    "not_found_page_heading": "varchar",
    "not_found_page_meta_description": "varchar",
    "not_found_page_meta_title": "varchar",
    "privacy_last_updated": "varchar",
    "privacy_policy": "jsonb",
    "site_name": "varchar",
    "site_url": "varchar",
    "twitter_handle": "varchar",
    "updated_at": "timestamp(3) with time zone"
  },
  "site_settings_footer_columns": {
    "_order": "integer",
    "_parent_id": "integer",
    "id": "varchar",
    "title": "varchar"
  },
  "site_settings_footer_columns_links": {
    "_order": "integer",
    "_parent_id": "varchar",
    "href": "varchar",
    "id": "varchar",
    "label": "varchar"
  },
  "site_settings_header_buttons": {
    "_order": "integer",
    "_parent_id": "integer",
    "href": "varchar",
    "id": "varchar",
    "is_visible": "boolean",
    "label": "varchar",
    "variant": "enum_site_settings_header_buttons_variant"
  },
  "site_settings_json_ld_same_as": {
    "_order": "integer",
    "_parent_id": "integer",
    "id": "varchar",
    "url": "varchar"
  },
  "site_settings_navigation_links": {
    "_order": "integer",
    "_parent_id": "integer",
    "href": "varchar",
    "id": "varchar",
    "is_visible": "boolean",
    "label": "varchar"
  },
  "site_settings_social_links": {
    "_order": "integer",
    "_parent_id": "integer",
    "id": "varchar",
    "label": "varchar",
    "url": "varchar"
  },
  "spacer": {
    "_order": "integer",
    "_parent_id": "integer",
    "_path": "text",
    "block_name": "varchar",
    "height": "numeric",
    "id": "varchar",
    "structural_key": "varchar"
  },
  "split_sec": {
    "_order": "integer",
    "_parent_id": "integer",
    "_path": "text",
    "anchor_id": "varchar",
    "background_color": "varchar",
    "block_name": "varchar",
    "custom_class_name": "varchar",
    "heading_size": "enum_split_sec_heading_size",
    "heading_tag": "enum_split_sec_heading_tag",
    "id": "varchar",
    "is_hidden": "boolean",
    "layout": "enum_split_sec_layout",
    "left_content": "jsonb",
    "left_cta_href": "varchar",
    "left_cta_label": "varchar",
    "left_heading": "varchar",
    "left_image_id": "integer",
    "left_type": "enum_split_sec_left_type",
    "left_video_url": "varchar",
    "reverse_on_mobile": "boolean",
    "right_content": "jsonb",
    "right_cta_href": "varchar",
    "right_cta_label": "varchar",
    "right_heading": "varchar",
    "right_image_id": "integer",
    "right_type": "enum_split_sec_right_type",
    "right_video_url": "varchar",
    "section_label": "varchar",
    "size": "enum_split_sec_size",
    "structural_key": "varchar",
    "text_align": "enum_split_sec_text_align",
    "theme": "enum_split_sec_theme",
    "vertical_align": "enum_split_sec_vertical_align",
    "visible_from": "timestamp(3) with time zone",
    "visible_until": "timestamp(3) with time zone"
  },
  "stats_items": {
    "_order": "integer",
    "_parent_id": "varchar",
    "description": "varchar",
    "id": "varchar",
    "label": "varchar",
    "value": "varchar"
  },
  "stats_sec": {
    "_order": "integer",
    "_parent_id": "integer",
    "_path": "text",
    "anchor_id": "varchar",
    "background_color": "varchar",
    "block_name": "varchar",
    "custom_class_name": "varchar",
    "heading": "varchar",
    "heading_size": "enum_stats_sec_heading_size",
    "heading_tag": "enum_stats_sec_heading_tag",
    "id": "varchar",
    "is_hidden": "boolean",
    "section_label": "varchar",
    "size": "enum_stats_sec_size",
    "structural_key": "varchar",
    "subheading": "varchar",
    "text_align": "enum_stats_sec_text_align",
    "theme": "enum_stats_sec_theme",
    "visible_from": "timestamp(3) with time zone",
    "visible_until": "timestamp(3) with time zone"
  },
  "stbl_cells": {
    "_order": "integer",
    "_parent_id": "varchar",
    "id": "varchar",
    "value": "varchar"
  },
  "stbl_cols": {
    "_order": "integer",
    "_parent_id": "varchar",
    "id": "varchar",
    "label": "varchar"
  },
  "stbl_rows": {
    "_order": "integer",
    "_parent_id": "varchar",
    "id": "varchar"
  },
  "tabs_items": {
    "_order": "integer",
    "_parent_id": "varchar",
    "body": "varchar",
    "heading": "varchar",
    "id": "varchar",
    "image_id": "integer",
    "label": "varchar",
    "link_href": "varchar",
    "link_label": "varchar"
  },
  "tabs_sec": {
    "_order": "integer",
    "_parent_id": "integer",
    "_path": "text",
    "anchor_id": "varchar",
    "background_color": "varchar",
    "block_name": "varchar",
    "custom_class_name": "varchar",
    "heading": "varchar",
    "heading_size": "enum_tabs_sec_heading_size",
    "heading_tag": "enum_tabs_sec_heading_tag",
    "id": "varchar",
    "is_hidden": "boolean",
    "section_label": "varchar",
    "size": "enum_tabs_sec_size",
    "structural_key": "varchar",
    "subheading": "varchar",
    "text_align": "enum_tabs_sec_text_align",
    "theme": "enum_tabs_sec_theme",
    "visible_from": "timestamp(3) with time zone",
    "visible_until": "timestamp(3) with time zone"
  },
  "team_members": {
    "_status": "enum_team_members_status",
    "approved_at": "timestamp(3) with time zone",
    "approved_by_id": "integer",
    "bio": "varchar",
    "created_at": "timestamp(3) with time zone",
    "created_by_id": "integer",
    "deleted_at": "timestamp(3) with time zone",
    "id": "serial",
    "linkedin_url": "varchar",
    "name": "varchar",
    "order": "numeric",
    "photo_id": "integer",
    "rejection_reason": "varchar",
    "review_checklist_complete": "boolean",
    "review_summary": "varchar",
    "role": "varchar",
    "submitted_at": "timestamp(3) with time zone",
    "submitted_by_id": "integer",
    "twitter_url": "varchar",
    "updated_at": "timestamp(3) with time zone",
    "workflow_status": "enum_team_members_workflow_status"
  },
  "team_sec": {
    "_order": "integer",
    "_parent_id": "integer",
    "_path": "text",
    "anchor_id": "varchar",
    "background_color": "varchar",
    "block_name": "varchar",
    "columns": "enum_team_sec_columns",
    "custom_class_name": "varchar",
    "heading": "varchar",
    "heading_size": "enum_team_sec_heading_size",
    "heading_tag": "enum_team_sec_heading_tag",
    "id": "varchar",
    "is_hidden": "boolean",
    "section_label": "varchar",
    "size": "enum_team_sec_size",
    "structural_key": "varchar",
    "subheading": "varchar",
    "text_align": "enum_team_sec_text_align",
    "theme": "enum_team_sec_theme",
    "visible_from": "timestamp(3) with time zone",
    "visible_until": "timestamp(3) with time zone"
  },
  "testimonials": {
    "_status": "enum_testimonials_status",
    "approved_at": "timestamp(3) with time zone",
    "approved_by_id": "integer",
    "avatar_id": "integer",
    "company": "varchar",
    "created_at": "timestamp(3) with time zone",
    "created_by_id": "integer",
    "deleted_at": "timestamp(3) with time zone",
    "details": "jsonb",
    "id": "serial",
    "is_featured": "boolean",
    "locale": "enum_testimonials_locale",
    "meta_description": "varchar",
    "meta_image_id": "integer",
    "meta_title": "varchar",
    "name": "varchar",
    "quote": "varchar",
    "rating": "numeric",
    "rejection_reason": "varchar",
    "review_checklist_complete": "boolean",
    "review_summary": "varchar",
    "role": "varchar",
    "slug": "varchar",
    "submitted_at": "timestamp(3) with time zone",
    "submitted_by_id": "integer",
    "translation_group_id": "varchar",
    "updated_at": "timestamp(3) with time zone",
    "workflow_status": "enum_testimonials_workflow_status"
  },
  "testimonials_tags": {
    "_order": "integer",
    "_parent_id": "integer",
    "id": "varchar",
    "tag": "varchar"
  },
  "ui_settings": {
    "_status": "enum_ui_settings_status",
    "buttons_ghost_background": "varchar",
    "buttons_ghost_background_hover": "varchar",
    "buttons_ghost_text": "varchar",
    "buttons_nav_background": "varchar",
    "buttons_nav_background_hover": "varchar",
    "buttons_nav_text": "varchar",
    "buttons_primary_background": "varchar",
    "buttons_primary_background_hover": "varchar",
    "buttons_primary_text": "varchar",
    "buttons_radius": "numeric",
    "buttons_secondary_background": "varchar",
    "buttons_secondary_background_hover": "varchar",
    "buttons_secondary_text": "varchar",
    "buttons_secondary_text_hover": "varchar",
    "colors_background": "varchar",
    "colors_black_background": "varchar",
    "colors_border": "varchar",
    "colors_charcoal_background": "varchar",
    "colors_cookie_background": "varchar",
    "colors_cookie_link": "varchar",
    "colors_cookie_text": "varchar",
    "colors_dark_text": "varchar",
    "colors_dark_text_muted": "varchar",
    "colors_focus_ring": "varchar",
    "colors_footer_background": "varchar",
    "colors_footer_muted_text": "varchar",
    "colors_footer_text": "varchar",
    "colors_hero_background": "varchar",
    "colors_hero_muted_text": "varchar",
    "colors_hero_text": "varchar",
    "colors_link": "varchar",
    "colors_nav_background": "varchar",
    "colors_nav_border": "varchar",
    "colors_nav_scrolled_background": "varchar",
    "colors_navy_background": "varchar",
    "colors_primary": "varchar",
    "colors_primary_hover": "varchar",
    "colors_section_alt": "varchar",
    "colors_surface": "varchar",
    "colors_text": "varchar",
    "colors_text_muted": "varchar",
    "created_at": "timestamp(3) with time zone",
    "email_palette_background": "varchar",
    "email_palette_border": "varchar",
    "email_palette_error": "varchar",
    "email_palette_muted": "varchar",
    "email_palette_primary": "varchar",
    "email_palette_text": "varchar",
    "email_palette_white": "varchar",
    "id": "serial",
    "layout_card_radius": "numeric",
    "layout_container_max_width": "varchar",
    "layout_hero_padding_compact": "varchar",
    "layout_hero_padding_regular": "varchar",
    "layout_hero_padding_spacious": "varchar",
    "layout_mobile_section_padding": "varchar",
    "layout_nav_height": "numeric",
    "layout_section_padding_compact": "varchar",
    "layout_section_padding_regular": "varchar",
    "layout_section_padding_spacious": "varchar",
    "typography_base_font_size": "numeric",
    "typography_base_line_height": "numeric",
    "typography_body_font_family": "varchar",
    "typography_body_font_url": "varchar",
    "typography_display_font_family": "varchar",
    "typography_heading_font_url": "varchar",
    "typography_heading_letter_spacing": "varchar",
    "typography_section_label_letter_spacing": "varchar",
    "updated_at": "timestamp(3) with time zone"
  },
  "users": {
    "api_key": "varchar",
    "api_key_index": "varchar",
    "can_manage_system_fields": "boolean",
    "cms_lane_preference": "enum_users_cms_lane_preference",
    "created_at": "timestamp(3) with time zone",
    "email": "varchar",
    "enable_a_p_i_key": "boolean",
    "hash": "varchar",
    "id": "serial",
    "lock_until": "timestamp(3) with time zone",
    "login_attempts": "numeric",
    "name": "varchar",
    "reset_password_expiration": "timestamp(3) with time zone",
    "reset_password_token": "varchar",
    "role": "enum_users_role",
    "salt": "varchar",
    "show_cms_training_hints": "boolean",
    "updated_at": "timestamp(3) with time zone"
  },
  "users_sessions": {
    "_order": "integer",
    "_parent_id": "integer",
    "created_at": "timestamp(3) with time zone",
    "expires_at": "timestamp(3) with time zone",
    "id": "varchar"
  },
  "vid_sec": {
    "_order": "integer",
    "_parent_id": "integer",
    "_path": "text",
    "anchor_id": "varchar",
    "background_color": "varchar",
    "block_name": "varchar",
    "custom_class_name": "varchar",
    "embed_url": "varchar",
    "heading": "varchar",
    "heading_size": "enum_vid_sec_heading_size",
    "heading_tag": "enum_vid_sec_heading_tag",
    "id": "varchar",
    "is_hidden": "boolean",
    "poster_image_id": "integer",
    "section_label": "varchar",
    "size": "enum_vid_sec_size",
    "structural_key": "varchar",
    "text_align": "enum_vid_sec_text_align",
    "theme": "enum_vid_sec_theme",
    "visible_from": "timestamp(3) with time zone",
    "visible_until": "timestamp(3) with time zone"
  }
}$table_manifest$::jsonb;
  enum_manifest jsonb := $enum_manifest${
  "public.dl_sort_dir": [
    "asc",
    "desc"
  ],
  "public.dl_source": [
    "serviceItem",
    "blogPost",
    "testimonial"
  ],
  "public.dl_view_mode": [
    "cards",
    "list",
    "table"
  ],
  "public.enum__blog_posts_v_version_locale": [
    "en",
    "de",
    "fr",
    "es",
    "it"
  ],
  "public.enum__blog_posts_v_version_status": [
    "draft",
    "published"
  ],
  "public.enum__blog_posts_v_version_workflow_status": [
    "draft",
    "in_review",
    "approved",
    "rejected",
    "published"
  ],
  "public.enum__logos_v_version_status": [
    "draft",
    "published"
  ],
  "public.enum__logos_v_version_workflow_status": [
    "draft",
    "in_review",
    "approved",
    "rejected",
    "published"
  ],
  "public.enum__org_about_profiles_v_version_category": [
    "founder",
    "volunteer_team",
    "mentor"
  ],
  "public.enum__org_about_profiles_v_version_status": [
    "draft",
    "published"
  ],
  "public.enum__org_about_profiles_v_version_workflow_status": [
    "draft",
    "in_review",
    "approved",
    "rejected",
    "published"
  ],
  "public.enum__org_events_v_version_event_status": [
    "upcoming_planned",
    "current_ongoing",
    "past_completed"
  ],
  "public.enum__org_events_v_version_event_type": [
    "concert",
    "competition",
    "festival",
    "workshop"
  ],
  "public.enum__org_events_v_version_status": [
    "draft",
    "published"
  ],
  "public.enum__org_events_v_version_workflow_status": [
    "draft",
    "in_review",
    "approved",
    "rejected",
    "published"
  ],
  "public.enum__org_home_features_v_version_home_section_order": [
    "events",
    "spotlight",
    "learning",
    "sponsors"
  ],
  "public.enum__org_home_features_v_version_status": [
    "draft",
    "published"
  ],
  "public.enum__org_learning_v_version_category": [
    "knowledge_sharing",
    "college_prep",
    "mentorship"
  ],
  "public.enum__org_learning_v_version_status": [
    "draft",
    "published"
  ],
  "public.enum__org_learning_v_version_workflow_status": [
    "draft",
    "in_review",
    "approved",
    "rejected",
    "published"
  ],
  "public.enum__org_sponsors_v_version_display_order": [
    "support_summary",
    "sponsor_acknowledgment",
    "donation_instructions",
    "payment_instructions",
    "sponsor_logos",
    "support_faq",
    "featured_supporter_text"
  ],
  "public.enum__org_sponsors_v_version_status": [
    "draft",
    "published"
  ],
  "public.enum__org_spotlight_v_version_category": [
    "student",
    "teacher",
    "volunteer",
    "local_organization",
    "local_prominent_artist"
  ],
  "public.enum__org_spotlight_v_version_status": [
    "draft",
    "published"
  ],
  "public.enum__org_spotlight_v_version_workflow_status": [
    "draft",
    "in_review",
    "approved",
    "rejected",
    "published"
  ],
  "public.enum__service_items_v_version_currency": [
    "USD",
    "EUR",
    "GBP"
  ],
  "public.enum__service_items_v_version_locale": [
    "en",
    "de",
    "fr",
    "es",
    "it"
  ],
  "public.enum__service_items_v_version_status": [
    "draft",
    "published"
  ],
  "public.enum__service_items_v_version_workflow_status": [
    "draft",
    "in_review",
    "approved",
    "rejected",
    "published"
  ],
  "public.enum__site_settings_v_version_header_buttons_variant": [
    "primary",
    "ghost"
  ],
  "public.enum__site_settings_v_version_status": [
    "draft",
    "published"
  ],
  "public.enum__team_members_v_version_status": [
    "draft",
    "published"
  ],
  "public.enum__team_members_v_version_workflow_status": [
    "draft",
    "in_review",
    "approved",
    "rejected",
    "published"
  ],
  "public.enum__testimonials_v_version_locale": [
    "en",
    "de",
    "fr",
    "es",
    "it"
  ],
  "public.enum__testimonials_v_version_status": [
    "draft",
    "published"
  ],
  "public.enum__testimonials_v_version_workflow_status": [
    "draft",
    "in_review",
    "approved",
    "rejected",
    "published"
  ],
  "public.enum__ui_settings_v_version_status": [
    "draft",
    "published"
  ],
  "public.enum_audit_logs_action": [
    "create",
    "update",
    "delete"
  ],
  "public.enum_audit_logs_risk_tier": [
    "routine",
    "system"
  ],
  "public.enum_blog_categories_workflow_status": [
    "draft",
    "in_review",
    "approved",
    "rejected",
    "published"
  ],
  "public.enum_blog_posts_locale": [
    "en",
    "de",
    "fr",
    "es",
    "it"
  ],
  "public.enum_blog_posts_status": [
    "draft",
    "published"
  ],
  "public.enum_blog_posts_workflow_status": [
    "draft",
    "in_review",
    "approved",
    "rejected",
    "published"
  ],
  "public.enum_cmp_table_heading_size": [
    "xs",
    "sm",
    "md",
    "lg",
    "xl"
  ],
  "public.enum_cmp_table_heading_tag": [
    "h1",
    "h2",
    "h3",
    "h4"
  ],
  "public.enum_cmp_table_size": [
    "compact",
    "regular",
    "spacious"
  ],
  "public.enum_cmp_table_text_align": [
    "left",
    "center",
    "right"
  ],
  "public.enum_cmp_table_theme": [
    "navy",
    "charcoal",
    "black",
    "white",
    "light"
  ],
  "public.enum_cta_heading_size": [
    "xs",
    "sm",
    "md",
    "lg",
    "xl"
  ],
  "public.enum_cta_heading_tag": [
    "h1",
    "h2",
    "h3",
    "h4"
  ],
  "public.enum_cta_size": [
    "compact",
    "regular",
    "spacious"
  ],
  "public.enum_cta_text_align": [
    "left",
    "center",
    "right"
  ],
  "public.enum_cta_theme": [
    "navy",
    "charcoal",
    "black",
    "white",
    "light"
  ],
  "public.enum_divider_heading_size": [
    "xs",
    "sm",
    "md",
    "lg",
    "xl"
  ],
  "public.enum_divider_heading_tag": [
    "h1",
    "h2",
    "h3",
    "h4"
  ],
  "public.enum_divider_size": [
    "compact",
    "regular",
    "spacious"
  ],
  "public.enum_divider_text_align": [
    "left",
    "center",
    "right"
  ],
  "public.enum_divider_theme": [
    "navy",
    "charcoal",
    "black",
    "white",
    "light"
  ],
  "public.enum_dyn_list_heading_size": [
    "xs",
    "sm",
    "md",
    "lg",
    "xl"
  ],
  "public.enum_dyn_list_heading_tag": [
    "h1",
    "h2",
    "h3",
    "h4"
  ],
  "public.enum_dyn_list_size": [
    "compact",
    "regular",
    "spacious"
  ],
  "public.enum_dyn_list_text_align": [
    "left",
    "center",
    "right"
  ],
  "public.enum_dyn_list_theme": [
    "navy",
    "charcoal",
    "black",
    "white",
    "light"
  ],
  "public.enum_exports_drafts": [
    "yes",
    "no"
  ],
  "public.enum_exports_format": [
    "csv",
    "json"
  ],
  "public.enum_exports_sort_order": [
    "asc",
    "desc"
  ],
  "public.enum_faq_sec_heading_size": [
    "xs",
    "sm",
    "md",
    "lg",
    "xl"
  ],
  "public.enum_faq_sec_heading_tag": [
    "h1",
    "h2",
    "h3",
    "h4"
  ],
  "public.enum_faq_sec_size": [
    "compact",
    "regular",
    "spacious"
  ],
  "public.enum_faq_sec_text_align": [
    "left",
    "center",
    "right"
  ],
  "public.enum_faq_sec_theme": [
    "navy",
    "charcoal",
    "black",
    "white",
    "light"
  ],
  "public.enum_feat_grid_columns": [
    "2",
    "3",
    "4"
  ],
  "public.enum_feat_grid_heading_size": [
    "xs",
    "sm",
    "md",
    "lg",
    "xl"
  ],
  "public.enum_feat_grid_heading_tag": [
    "h1",
    "h2",
    "h3",
    "h4"
  ],
  "public.enum_feat_grid_size": [
    "compact",
    "regular",
    "spacious"
  ],
  "public.enum_feat_grid_text_align": [
    "left",
    "center",
    "right"
  ],
  "public.enum_feat_grid_theme": [
    "navy",
    "charcoal",
    "black",
    "white",
    "light"
  ],
  "public.enum_form_sec_heading_size": [
    "xs",
    "sm",
    "md",
    "lg",
    "xl"
  ],
  "public.enum_form_sec_heading_tag": [
    "h1",
    "h2",
    "h3",
    "h4"
  ],
  "public.enum_form_sec_size": [
    "compact",
    "regular",
    "spacious"
  ],
  "public.enum_form_sec_text_align": [
    "left",
    "center",
    "right"
  ],
  "public.enum_form_sec_theme": [
    "navy",
    "charcoal",
    "black",
    "white",
    "light"
  ],
  "public.enum_forms_confirmation_type": [
    "message",
    "redirect"
  ],
  "public.enum_hero_heading_size": [
    "xs",
    "sm",
    "md",
    "lg",
    "xl"
  ],
  "public.enum_hero_heading_tag": [
    "h1",
    "h2",
    "h3",
    "h4"
  ],
  "public.enum_hero_size": [
    "compact",
    "regular",
    "spacious"
  ],
  "public.enum_hero_text_align": [
    "left",
    "center",
    "right"
  ],
  "public.enum_hero_text_alignment": [
    "left",
    "center",
    "right"
  ],
  "public.enum_hero_theme": [
    "navy",
    "charcoal",
    "black",
    "white",
    "light"
  ],
  "public.enum_img_sec_aspect_ratio": [
    "auto",
    "square",
    "landscape",
    "portrait"
  ],
  "public.enum_img_sec_display_mode": [
    "grid",
    "slideshow"
  ],
  "public.enum_img_sec_heading_size": [
    "xs",
    "sm",
    "md",
    "lg",
    "xl"
  ],
  "public.enum_img_sec_heading_tag": [
    "h1",
    "h2",
    "h3",
    "h4"
  ],
  "public.enum_img_sec_size": [
    "compact",
    "regular",
    "spacious"
  ],
  "public.enum_img_sec_text_align": [
    "left",
    "center",
    "right"
  ],
  "public.enum_img_sec_theme": [
    "navy",
    "charcoal",
    "black",
    "white",
    "light"
  ],
  "public.enum_imports_import_mode": [
    "create",
    "update",
    "upsert"
  ],
  "public.enum_imports_status": [
    "pending",
    "completed",
    "partial",
    "failed"
  ],
  "public.enum_logo_band_display_mode": [
    "static",
    "marquee"
  ],
  "public.enum_logo_band_heading_size": [
    "xs",
    "sm",
    "md",
    "lg",
    "xl"
  ],
  "public.enum_logo_band_heading_tag": [
    "h1",
    "h2",
    "h3",
    "h4"
  ],
  "public.enum_logo_band_size": [
    "compact",
    "regular",
    "spacious"
  ],
  "public.enum_logo_band_text_align": [
    "left",
    "center",
    "right"
  ],
  "public.enum_logo_band_theme": [
    "navy",
    "charcoal",
    "black",
    "white",
    "light"
  ],
  "public.enum_logos_status": [
    "draft",
    "published"
  ],
  "public.enum_logos_workflow_status": [
    "draft",
    "in_review",
    "approved",
    "rejected",
    "published"
  ],
  "public.enum_media_media_qa_status": [
    "pending",
    "approved",
    "restricted"
  ],
  "public.enum_media_usage_scope": [
    "site-only",
    "marketing",
    "licensed-third-party"
  ],
  "public.enum_org_about_profiles_category": [
    "founder",
    "volunteer_team",
    "mentor"
  ],
  "public.enum_org_about_profiles_status": [
    "draft",
    "published"
  ],
  "public.enum_org_about_profiles_workflow_status": [
    "draft",
    "in_review",
    "approved",
    "rejected",
    "published"
  ],
  "public.enum_org_events_event_status": [
    "upcoming_planned",
    "current_ongoing",
    "past_completed"
  ],
  "public.enum_org_events_event_type": [
    "concert",
    "competition",
    "festival",
    "workshop"
  ],
  "public.enum_org_events_status": [
    "draft",
    "published"
  ],
  "public.enum_org_events_workflow_status": [
    "draft",
    "in_review",
    "approved",
    "rejected",
    "published"
  ],
  "public.enum_org_home_features_home_section_order": [
    "events",
    "spotlight",
    "learning",
    "sponsors"
  ],
  "public.enum_org_home_features_status": [
    "draft",
    "published"
  ],
  "public.enum_org_learning_category": [
    "knowledge_sharing",
    "college_prep",
    "mentorship"
  ],
  "public.enum_org_learning_status": [
    "draft",
    "published"
  ],
  "public.enum_org_learning_workflow_status": [
    "draft",
    "in_review",
    "approved",
    "rejected",
    "published"
  ],
  "public.enum_org_sponsors_display_order": [
    "support_summary",
    "sponsor_acknowledgment",
    "donation_instructions",
    "payment_instructions",
    "sponsor_logos",
    "support_faq",
    "featured_supporter_text"
  ],
  "public.enum_org_sponsors_status": [
    "draft",
    "published"
  ],
  "public.enum_org_spotlight_category": [
    "student",
    "teacher",
    "volunteer",
    "local_organization",
    "local_prominent_artist"
  ],
  "public.enum_org_spotlight_status": [
    "draft",
    "published"
  ],
  "public.enum_org_spotlight_workflow_status": [
    "draft",
    "in_review",
    "approved",
    "rejected",
    "published"
  ],
  "public.enum_page_drafts_source_type": [
    "blank",
    "from-live",
    "from-preset",
    "from-playground"
  ],
  "public.enum_page_drafts_workflow_status": [
    "draft",
    "in_review",
    "approved",
    "rejected",
    "published"
  ],
  "public.enum_page_playgrounds_visibility": [
    "private",
    "team"
  ],
  "public.enum_page_presets_category": [
    "core",
    "landing",
    "campaign",
    "internal",
    "custom"
  ],
  "public.enum_page_presets_source_type": [
    "manual",
    "from-live",
    "from-draft",
    "from-playground"
  ],
  "public.enum_page_presets_structure_mode": [
    "editable",
    "locked"
  ],
  "public.enum_payload_folders_folder_type": [
    "media"
  ],
  "public.enum_payload_jobs_log_state": [
    "failed",
    "succeeded"
  ],
  "public.enum_payload_jobs_log_task_slug": [
    "inline",
    "createCollectionExport",
    "createCollectionImport"
  ],
  "public.enum_payload_jobs_task_slug": [
    "inline",
    "createCollectionExport",
    "createCollectionImport"
  ],
  "public.enum_payload_query_presets_access_delete_constraint": [
    "everyone",
    "onlyMe",
    "specificUsers"
  ],
  "public.enum_payload_query_presets_access_read_constraint": [
    "everyone",
    "onlyMe",
    "specificUsers"
  ],
  "public.enum_payload_query_presets_access_update_constraint": [
    "everyone",
    "onlyMe",
    "specificUsers"
  ],
  "public.enum_payload_query_presets_related_collection": [
    "users",
    "media",
    "service-items",
    "site-pages",
    "page-drafts",
    "page-presets",
    "page-playgrounds",
    "reusable-sections",
    "redirect-rules",
    "blog-posts",
    "blog-categories",
    "testimonials",
    "team-members",
    "logos",
    "org-events",
    "org-spotlight",
    "org-about-profiles",
    "org-learning",
    "forms"
  ],
  "public.enum_privacy_note_heading_size": [
    "xs",
    "sm",
    "md",
    "lg",
    "xl"
  ],
  "public.enum_privacy_note_heading_tag": [
    "h1",
    "h2",
    "h3",
    "h4"
  ],
  "public.enum_privacy_note_size": [
    "compact",
    "regular",
    "spacious"
  ],
  "public.enum_privacy_note_text_align": [
    "left",
    "center",
    "right"
  ],
  "public.enum_privacy_note_theme": [
    "navy",
    "charcoal",
    "black",
    "white",
    "light"
  ],
  "public.enum_quote_sec_heading_size": [
    "xs",
    "sm",
    "md",
    "lg",
    "xl"
  ],
  "public.enum_quote_sec_heading_tag": [
    "h1",
    "h2",
    "h3",
    "h4"
  ],
  "public.enum_quote_sec_size": [
    "compact",
    "regular",
    "spacious"
  ],
  "public.enum_quote_sec_style": [
    "centered",
    "left-border",
    "pull"
  ],
  "public.enum_quote_sec_text_align": [
    "left",
    "center",
    "right"
  ],
  "public.enum_quote_sec_theme": [
    "navy",
    "charcoal",
    "black",
    "white",
    "light"
  ],
  "public.enum_reuse_sec_library_category": [
    "general",
    "hero",
    "cta",
    "table",
    "form"
  ],
  "public.enum_reuse_sec_locale": [
    "en",
    "de",
    "fr",
    "es",
    "it"
  ],
  "public.enum_reuse_sec_ref_heading_size": [
    "xs",
    "sm",
    "md",
    "lg",
    "xl"
  ],
  "public.enum_reuse_sec_ref_heading_tag": [
    "h1",
    "h2",
    "h3",
    "h4"
  ],
  "public.enum_reuse_sec_ref_size": [
    "compact",
    "regular",
    "spacious"
  ],
  "public.enum_reuse_sec_ref_text_align": [
    "left",
    "center",
    "right"
  ],
  "public.enum_reuse_sec_ref_theme": [
    "navy",
    "charcoal",
    "black",
    "white",
    "light"
  ],
  "public.enum_reuse_sec_workflow_status": [
    "draft",
    "in_review",
    "approved",
    "rejected",
    "published"
  ],
  "public.enum_richtext_heading_size": [
    "xs",
    "sm",
    "md",
    "lg",
    "xl"
  ],
  "public.enum_richtext_heading_tag": [
    "h1",
    "h2",
    "h3",
    "h4"
  ],
  "public.enum_richtext_size": [
    "compact",
    "regular",
    "spacious"
  ],
  "public.enum_richtext_text_align": [
    "left",
    "center",
    "right"
  ],
  "public.enum_richtext_theme": [
    "navy",
    "charcoal",
    "black",
    "white",
    "light"
  ],
  "public.enum_service_items_currency": [
    "USD",
    "EUR",
    "GBP"
  ],
  "public.enum_service_items_locale": [
    "en",
    "de",
    "fr",
    "es",
    "it"
  ],
  "public.enum_service_items_status": [
    "draft",
    "published"
  ],
  "public.enum_service_items_workflow_status": [
    "draft",
    "in_review",
    "approved",
    "rejected",
    "published"
  ],
  "public.enum_simple_table_heading_size": [
    "xs",
    "sm",
    "md",
    "lg",
    "xl"
  ],
  "public.enum_simple_table_heading_tag": [
    "h1",
    "h2",
    "h3",
    "h4"
  ],
  "public.enum_simple_table_size": [
    "compact",
    "regular",
    "spacious"
  ],
  "public.enum_simple_table_text_align": [
    "left",
    "center",
    "right"
  ],
  "public.enum_simple_table_theme": [
    "navy",
    "charcoal",
    "black",
    "white",
    "light"
  ],
  "public.enum_site_pages_preset_key": [
    "custom",
    "home",
    "services",
    "about",
    "pricing",
    "contact"
  ],
  "public.enum_site_pages_publish_quality_level": [
    "excellent",
    "good",
    "needs_attention",
    "blocked"
  ],
  "public.enum_site_pages_workflow_status": [
    "draft",
    "in_review",
    "approved",
    "rejected",
    "published"
  ],
  "public.enum_site_settings_header_buttons_variant": [
    "primary",
    "ghost"
  ],
  "public.enum_site_settings_status": [
    "draft",
    "published"
  ],
  "public.enum_split_sec_heading_size": [
    "xs",
    "sm",
    "md",
    "lg",
    "xl"
  ],
  "public.enum_split_sec_heading_tag": [
    "h1",
    "h2",
    "h3",
    "h4"
  ],
  "public.enum_split_sec_layout": [
    "60-40",
    "50-50",
    "40-60"
  ],
  "public.enum_split_sec_left_type": [
    "richText",
    "image",
    "video"
  ],
  "public.enum_split_sec_right_type": [
    "richText",
    "image",
    "video"
  ],
  "public.enum_split_sec_size": [
    "compact",
    "regular",
    "spacious"
  ],
  "public.enum_split_sec_text_align": [
    "left",
    "center",
    "right"
  ],
  "public.enum_split_sec_theme": [
    "navy",
    "charcoal",
    "black",
    "white",
    "light"
  ],
  "public.enum_split_sec_vertical_align": [
    "top",
    "center",
    "bottom"
  ],
  "public.enum_stats_sec_heading_size": [
    "xs",
    "sm",
    "md",
    "lg",
    "xl"
  ],
  "public.enum_stats_sec_heading_tag": [
    "h1",
    "h2",
    "h3",
    "h4"
  ],
  "public.enum_stats_sec_size": [
    "compact",
    "regular",
    "spacious"
  ],
  "public.enum_stats_sec_text_align": [
    "left",
    "center",
    "right"
  ],
  "public.enum_stats_sec_theme": [
    "navy",
    "charcoal",
    "black",
    "white",
    "light"
  ],
  "public.enum_tabs_sec_heading_size": [
    "xs",
    "sm",
    "md",
    "lg",
    "xl"
  ],
  "public.enum_tabs_sec_heading_tag": [
    "h1",
    "h2",
    "h3",
    "h4"
  ],
  "public.enum_tabs_sec_size": [
    "compact",
    "regular",
    "spacious"
  ],
  "public.enum_tabs_sec_text_align": [
    "left",
    "center",
    "right"
  ],
  "public.enum_tabs_sec_theme": [
    "navy",
    "charcoal",
    "black",
    "white",
    "light"
  ],
  "public.enum_team_members_status": [
    "draft",
    "published"
  ],
  "public.enum_team_members_workflow_status": [
    "draft",
    "in_review",
    "approved",
    "rejected",
    "published"
  ],
  "public.enum_team_sec_columns": [
    "2",
    "3",
    "4"
  ],
  "public.enum_team_sec_heading_size": [
    "xs",
    "sm",
    "md",
    "lg",
    "xl"
  ],
  "public.enum_team_sec_heading_tag": [
    "h1",
    "h2",
    "h3",
    "h4"
  ],
  "public.enum_team_sec_size": [
    "compact",
    "regular",
    "spacious"
  ],
  "public.enum_team_sec_text_align": [
    "left",
    "center",
    "right"
  ],
  "public.enum_team_sec_theme": [
    "navy",
    "charcoal",
    "black",
    "white",
    "light"
  ],
  "public.enum_testimonials_locale": [
    "en",
    "de",
    "fr",
    "es",
    "it"
  ],
  "public.enum_testimonials_status": [
    "draft",
    "published"
  ],
  "public.enum_testimonials_workflow_status": [
    "draft",
    "in_review",
    "approved",
    "rejected",
    "published"
  ],
  "public.enum_ui_settings_status": [
    "draft",
    "published"
  ],
  "public.enum_users_cms_lane_preference": [
    "simple",
    "advanced"
  ],
  "public.enum_users_role": [
    "admin",
    "editor",
    "author"
  ],
  "public.enum_vid_sec_heading_size": [
    "xs",
    "sm",
    "md",
    "lg",
    "xl"
  ],
  "public.enum_vid_sec_heading_tag": [
    "h1",
    "h2",
    "h3",
    "h4"
  ],
  "public.enum_vid_sec_size": [
    "compact",
    "regular",
    "spacious"
  ],
  "public.enum_vid_sec_text_align": [
    "left",
    "center",
    "right"
  ],
  "public.enum_vid_sec_theme": [
    "navy",
    "charcoal",
    "black",
    "white",
    "light"
  ],
  "public.template_key": [
    "guide",
    "inquiry",
    "newsletter"
  ]
}$enum_manifest$::jsonb;

  enum_entry record;
  table_entry record;
  col_entry record;

  schema_name text;
  enum_name text;
  enum_label text;

  first_col_name text;
  first_col_type text;
BEGIN
  -- Ensure every expected enum type exists with expected labels.
  FOR enum_entry IN
    SELECT key, value
    FROM jsonb_each(enum_manifest)
  LOOP
    schema_name := split_part(enum_entry.key, '.', 1);
    enum_name := split_part(enum_entry.key, '.', 2);

    IF enum_name = '' THEN
      schema_name := 'public';
      enum_name := enum_entry.key;
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_type t
      JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = schema_name
        AND t.typname = enum_name
    ) THEN
      -- The generated manifest always has non-empty enum labels, but keep a guard.
      IF jsonb_array_length(enum_entry.value) = 0 THEN
        CONTINUE;
      END IF;

      EXECUTE format(
        'CREATE TYPE %I.%I AS ENUM (%s)',
        schema_name,
        enum_name,
        (
          SELECT string_agg(quote_literal(label), ', ')
          FROM jsonb_array_elements_text(enum_entry.value) AS labels(label)
        )
      );
    END IF;

    FOR enum_label IN
      SELECT value
      FROM jsonb_array_elements_text(enum_entry.value)
    LOOP
      EXECUTE format(
        'ALTER TYPE %I.%I ADD VALUE IF NOT EXISTS %L',
        schema_name,
        enum_name,
        enum_label
      );
    END LOOP;
  END LOOP;

  -- Ensure every expected table/column exists.
  FOR table_entry IN
    SELECT key, value
    FROM jsonb_each(table_manifest)
  LOOP
    IF to_regclass(format('public.%I', table_entry.key)) IS NULL THEN
      SELECT key, value
      INTO first_col_name, first_col_type
      FROM jsonb_each_text(table_entry.value)
      ORDER BY key
      LIMIT 1;

      IF first_col_name IS NULL THEN
        EXECUTE format(
          'CREATE TABLE IF NOT EXISTS public.%I ()',
          table_entry.key
        );
      ELSE
        EXECUTE format(
          'CREATE TABLE IF NOT EXISTS public.%I (%I %s)',
          table_entry.key,
          first_col_name,
          first_col_type
        );
      END IF;
    END IF;

    FOR col_entry IN
      SELECT key, value
      FROM jsonb_each_text(table_entry.value)
    LOOP
      EXECUTE format(
        'ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS %I %s',
        table_entry.key,
        col_entry.key,
        col_entry.value
      );
    END LOOP;
  END LOOP;

  -- Runtime-critical legacy stub repairs:
  -- these IDs were historically bootstrapped as integers, but Payload expects varchar IDs.
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'hero'
      AND column_name = 'id'
      AND udt_name IN ('int2', 'int4', 'int8')
  ) THEN
    EXECUTE 'ALTER TABLE public.hero ALTER COLUMN id TYPE varchar USING id::varchar';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'img_sec'
      AND column_name = 'id'
      AND udt_name IN ('int2', 'int4', 'int8')
  ) THEN
    EXECUTE 'ALTER TABLE public.img_sec ALTER COLUMN id TYPE varchar USING id::varchar';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'img_sec_images'
      AND column_name = 'id'
      AND udt_name IN ('int2', 'int4', 'int8')
  ) THEN
    EXECUTE 'ALTER TABLE public.img_sec_images ALTER COLUMN id TYPE varchar USING id::varchar';
  END IF;
END
$$;
