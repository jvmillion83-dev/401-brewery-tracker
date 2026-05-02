import { TapListModal } from '../components/TapListModal';
import uncommonData from '../../data/uncommon-pair-menu.json';
const [isModalVisible, setModalVisible] = useState(false);
<TouchableOpacity 
  style={styles.yellowButton} 
  onPress={() => setModalVisible(true)}
>
  <Text>📝 VIEW TAP LIST</Text>
</TouchableOpacity>