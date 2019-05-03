
import PleaseSignIn from '../components/PleaseSignIn';
import Orders from '../components/Orders';

const OrderPage = () => {
  return (
    <div>
      <PleaseSignIn>
        <Orders  />
      </PleaseSignIn>
    </div>
  );
};

export default OrderPage;
