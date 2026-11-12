import { useApp } from '../app/store';
import { NoteModal, ShiftModal, StaffModal, TalkModal } from './Modals';

const MODALS = { shift: ShiftModal, talk: TalkModal, staff: StaffModal, note: NoteModal };

/** Показывает окно, которое запросили через openModal. Ключ по счётчику, чтобы каждое открытие начиналось заново. */
export default function ModalHost() {
  const { modal, closeModal } = useApp();
  const Current = MODALS[modal.type];
  if (!Current) return null;
  return <Current key={modal.id} open={modal.open} onClose={closeModal} {...modal.props} />;
}
