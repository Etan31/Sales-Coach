import { useCallback, useId, useState } from 'react';
import styles from './Accordion.module.css';

/**
 * Accordion: pass `sections` (list of { id, title, content }) for multiple sections, or
 * `title` + `children` for a single section. Controlled via `openId`/`onToggle`, otherwise
 * manages its own open state (optionally seeded by `defaultOpenId`).
 */
function Accordion({ sections, title, children, openId: controlledOpenId, onToggle, defaultOpenId = null }) {
  const [internalOpenId, setInternalOpenId] = useState(defaultOpenId);
  const isControlled = controlledOpenId !== undefined;
  const openId = isControlled ? controlledOpenId : internalOpenId;
  const baseId = useId();

  const items = sections || [{ id: 'single', title, content: children }];

  const handleToggle = useCallback(
    (id) => {
      const nextId = openId === id ? null : id;
      if (isControlled) {
        onToggle?.(nextId);
      } else {
        setInternalOpenId(nextId);
      }
    },
    [openId, isControlled, onToggle]
  );

  return (
    <div className={styles.accordion}>
      {items.map((section) => {
        const isOpen = openId === section.id;
        const panelId = `${baseId}-panel-${section.id}`;
        const buttonId = `${baseId}-button-${section.id}`;
        return (
          <div className={styles.section} key={section.id}>
            <h3 className={styles.header}>
              <button
                type="button"
                id={buttonId}
                className={styles.trigger}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => handleToggle(section.id)}
              >
                <span>{section.title}</span>
                <span className={isOpen ? styles.iconOpen : styles.icon} aria-hidden="true">
                  &#9662;
                </span>
              </button>
            </h3>
            {isOpen && (
              <div id={panelId} role="region" aria-labelledby={buttonId} className={styles.panel}>
                {section.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default Accordion;
