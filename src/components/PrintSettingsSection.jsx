import { FormField } from "./FormField";
import { CollapsibleGroup } from "./CollapsibleGroup";
import { getGroupByKey, getLocalizedGroupLabel, getLocalizedPresetDescription, getPresetByKey, sizePresetGroups } from "../constants/sizePresets";

export function PrintSettingsSection({ form, language, t, onFieldChange }) {
  const activeGroup = getGroupByKey(form.sizeCategory);
  const activePreset = getPresetByKey(form.sizeCategory, form.sizePreset);

  return (
    <section className="panel-section">
      <h2>{t("printAndPage")}</h2>
      <CollapsibleGroup title={t("labelGroup")} subtitle={getLocalizedGroupLabel(activeGroup, language)} defaultOpen>
        <div className="inline-fields triple">
          <div>
            <label htmlFor="sizeCategory">{t("labelGroup")}</label>
            <select id="sizeCategory" value={form.sizeCategory} onChange={event => onFieldChange("sizeCategory", event.target.value)}>
              {sizePresetGroups.map(group => (
                <option key={group.key} value={group.key}>{getLocalizedGroupLabel(group, language)}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="sizePreset">{t("groupSize")}</label>
            <select id="sizePreset" value={form.sizePreset} onChange={event => onFieldChange("sizePreset", event.target.value)}>
              {activeGroup.presets.map(preset => (
                <option key={preset.key} value={preset.key}>{preset.label}</option>
              ))}
            </select>
          </div>
          <div></div>
        </div>
        <p className="scan-hint">{getLocalizedPresetDescription(activePreset, language)}</p>
        <div className="inline-fields">
          <div><FormField id="labelWidthMm" label={t("widthMm")} type="number" value={form.labelWidthMm} onChange={value => onFieldChange("labelWidthMm", value)} min={20} max={210} step={0.1} /></div>
          <div><FormField id="labelHeightMm" label={t("heightMm")} type="number" value={form.labelHeightMm} onChange={value => onFieldChange("labelHeightMm", value)} min={10} max={297} step={0.1} /></div>
        </div>
        <div className="inline-fields triple">
          <div><FormField id="pageMarginTop" label={t("topMarginMm")} type="number" value={form.pageMarginTop} onChange={value => onFieldChange("pageMarginTop", value)} min={0} max={40} step={1} /></div>
          <div><FormField id="pageMarginSide" label={t("sideMarginMm")} type="number" value={form.pageMarginSide} onChange={value => onFieldChange("pageMarginSide", value)} min={0} max={40} step={1} /></div>
          <div><FormField id="sheetGap" label={t("cellGapMm")} type="number" value={form.sheetGap} onChange={value => onFieldChange("sheetGap", value)} min={0} max={20} step={1} /></div>
        </div>
      </CollapsibleGroup>

      <CollapsibleGroup title={t("measurementHelpers")} subtitle={t("showGrid")} defaultOpen={false}>
        <div className="toggle-grid">
          <label className="toggle"><input type="checkbox" checked={form.showRulers} onChange={event => onFieldChange("showRulers", event.target.checked)} /><span>{t("showRuler")}</span></label>
          <label className="toggle"><input type="checkbox" checked={form.showCenterGuides} onChange={event => onFieldChange("showCenterGuides", event.target.checked)} /><span>{t("showCenterGuides")}</span></label>
          <label className="toggle"><input type="checkbox" checked={form.showGridOverlay} onChange={event => onFieldChange("showGridOverlay", event.target.checked)} /><span>{t("showGrid")}</span></label>
        </div>
        <FormField id="gridStepMm" label={t("gridStepMm")} type="number" value={form.gridStepMm} onChange={value => onFieldChange("gridStepMm", value)} min={2} max={50} step={1} />
      </CollapsibleGroup>
    </section>
  );
}
