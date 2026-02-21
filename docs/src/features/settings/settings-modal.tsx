import { Modal } from '../../ui/modal';
import { SegmentedControl } from '../../ui/segmented-control';
import { useUiStore } from '../../stores/ui-store';
import type { ThemeMode } from '../../theme/tokens';

const options: Array<{ label: string; value: ThemeMode }> = [
  { label: '跟随系统', value: 'system' },
  { label: '日间', value: 'day' },
  { label: '夜间', value: 'night' }
];

export function SettingsModal() {
  const open = useUiStore((state) => state.isSettingsOpen);
  const setOpen = useUiStore((state) => state.setSettingsOpen);
  const themeMode = useUiStore((state) => state.themeMode);
  const setThemeMode = useUiStore((state) => state.setThemeMode);

  return (
    <Modal open={open} title="全局设置" onClose={() => setOpen(false)}>
      <div className="settings-modal">
        <h3>主题</h3>
        <SegmentedControl value={themeMode} options={options} onChange={setThemeMode} />
      </div>
    </Modal>
  );
}
