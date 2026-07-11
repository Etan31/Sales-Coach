import styles from './Card.module.css';

/** Generic surface container: border, radius, shadow from tokens. */
function Card({ children, className = '', as: Component = 'div', ...rest }) {
  const classes = [styles.card, className].filter(Boolean).join(' ');
  return (
    <Component className={classes} {...rest}>
      {children}
    </Component>
  );
}

export default Card;
