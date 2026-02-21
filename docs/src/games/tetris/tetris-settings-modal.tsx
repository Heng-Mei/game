import { Modal } from '../../ui/modal';
import { Button } from '../../ui/button';
import { useTetrisSettingsStore } from '../../stores/tetris-settings-store';

type TetrisSettingsModalProps = {
  open: boolean;
  onClose: () => void;
};

export function TetrisSettingsModal({ open, onClose }: TetrisSettingsModalProps) {
  const keybinds = useTetrisSettingsStore((state) => state.keybinds);
  const dasFrames = useTetrisSettingsStore((state) => state.dasFrames);
  const arrFrames = useTetrisSettingsStore((state) => state.arrFrames);
  const dssFrames = useTetrisSettingsStore((state) => state.dssFrames);
  const setDasFrames = useTetrisSettingsStore((state) => state.setDasFrames);
  const setArrFrames = useTetrisSettingsStore((state) => state.setArrFrames);
  const setDssFrames = useTetrisSettingsStore((state) => state.setDssFrames);
  const reset = useTetrisSettingsStore((state) => state.reset);

  return (
    <Modal open={open} title="Tetris 键位与输入设置" onClose={onClose}>
      <div className="tetris-settings">
        <h3>键位 keybind</h3>
        <ul>
          {Object.entries(keybinds).map(([action, code]) => (
            <li key={action}>
              <span>{action}</span>
              <code>{code}</code>
            </li>
          ))}
        </ul>

        <h3>输入参数</h3>
        <label>
          DAS
          <input
            type="number"
            min={1}
            max={30}
            value={dasFrames}
            onChange={(event) => setDasFrames(Number(event.target.value) || 1)}
          />
        </label>
        <label>
          ARR
          <input
            type="number"
            min={0}
            max={10}
            value={arrFrames}
            onChange={(event) => setArrFrames(Number(event.target.value) || 0)}
          />
        </label>
        <label>
          DSS
          <input
            type="number"
            min={1}
            max={6}
            value={dssFrames}
            onChange={(event) => setDssFrames(Number(event.target.value) || 1)}
          />
        </label>

        <Button variant="primary" onClick={reset}>
          恢复默认
        </Button>
      </div>
    </Modal>
  );
}
