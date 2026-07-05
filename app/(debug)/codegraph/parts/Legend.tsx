import { KIND_COLOR } from '../colors';
import { styles } from '../styles';

export default function Legend() { return <div style={styles.legend}>{Object.entries(KIND_COLOR).map(([kind, color]) => <span key={kind} style={styles.legendItem}><span style={{ ...styles.legendDot, background: color }} />{kind}</span>)}</div>; }
