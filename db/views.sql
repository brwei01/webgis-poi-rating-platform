-- View: asset_with_latest_condition
CREATE OR REPLACE VIEW cege0043.asset_with_latest_condition AS
SELECT 
    ai.id AS asset_id,
    ai.asset_name,
    ai.installation_date,
    latest.latest_condition_report_date,
    aco.condition_description,
    aci.condition_id,
    ai.user_id,
    ai.location
FROM cege0043.asset_information ai
LEFT JOIN (
    SELECT asset_id,
           MAX(timestamp) AS latest_condition_report_date
    FROM cege0043.asset_condition_information
    GROUP BY asset_id
) latest
ON ai.id = latest.asset_id
LEFT JOIN cege0043.asset_condition_information aci
ON aci.asset_id = ai.id AND aci.timestamp = latest.latest_condition_report_date
LEFT JOIN cege0043.asset_condition_options aco
ON aci.condition_id = aco.id;

-- View: condition_reports_with_text_descriptions
CREATE OR REPLACE VIEW cege0043.condition_reports_with_text_descriptions AS
SELECT 
    aci.id AS id,
    aci.user_id,
    ai.asset_name,
    aco.condition_description,
    ai.location,
    aci.timestamp
FROM cege0043.asset_condition_information aci
JOIN cege0043.asset_information ai
ON aci.asset_id = ai.id
JOIN cege0043.asset_condition_options aco
ON aci.condition_id = aco.id;

-- View: report_summary (用于 L2 图表)
CREATE OR REPLACE VIEW cege0043.report_summary AS
SELECT 
    DATE(timestamp) AS day,
    COUNT(*) AS reports_submitted,
    COUNT(CASE WHEN condition_id IN 
        (SELECT id FROM cege0043.asset_condition_options 
         WHERE condition_description ILIKE '%not working%')
    THEN 1 END) AS not_working
FROM cege0043.asset_condition_information
GROUP BY DATE(timestamp);
