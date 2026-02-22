import { useState } from 'react';

type Props = {
  actionLabel: string;
  targetLabel: string;
  onSubmit?: (payload: { justification: string; approvalRequired: boolean }) => void;
};

export function ControlActionModal({ actionLabel, targetLabel, onSubmit }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [justification, setJustification] = useState('');
  const [approvalRequired, setApprovalRequired] = useState(false);

  function close() {
    setIsOpen(false);
    setJustification('');
    setApprovalRequired(false);
  }

  function submit() {
    if (!justification.trim()) {
      return;
    }
    onSubmit?.({ justification: justification.trim(), approvalRequired });
    close();
  }

  return (
    <>
      <button className="btn-primary" onClick={() => setIsOpen(true)}>
        {actionLabel}
      </button>
      {isOpen ? (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal">
            <h3>Control Action Confirmation</h3>
            <p className="text-muted">
              You are about to change {actionLabel} on {targetLabel}; logged for audit.
            </p>
            <label className="field">
              Justification (required)
              <textarea
                value={justification}
                onChange={(event) => setJustification(event.target.value)}
                rows={4}
                placeholder="Reason for this change"
              />
            </label>
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={approvalRequired}
                onChange={(event) => setApprovalRequired(event.target.checked)}
              />
              Require approval before dispatch (phase-2 placeholder)
            </label>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={close}>
                Cancel
              </button>
              <button className="btn-primary" disabled={!justification.trim()} onClick={submit}>
                Confirm and Log Action
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
