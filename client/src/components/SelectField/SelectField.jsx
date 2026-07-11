import { useId } from 'react';
import styles from './SelectField.module.css';

/** Labeled select control. options: [{ value, label }]. */
function SelectField({ label, value, onChange, options, name }) {
  const id = useId();

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <select id={id} name={name} value={value} onChange={onChange} className={styles.select}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SelectField;
