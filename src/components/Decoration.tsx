import styles from '../styles/Decoration.module.scss';

const Decoration = () => {
  const numCircles = 10; // Количество кругов

  return (
    <div className={styles.targetContainer}>
      <div className={styles.target}>
        {Array.from({ length: numCircles }).map((_, index) => (
          <div key={index} className={styles.circle}></div>
        ))}
      </div>
    </div>
  );
};

export default Decoration;
