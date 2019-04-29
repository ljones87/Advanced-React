import React from 'react';
import formatMoney from '../lib/formatMoney';
import styled from 'styled-components';

const CartItemsStyles = styled.li`
  
`

const CartItem = ({ cartItem }) => {
  return (
    <CartItemsStyles>
      <img width="100" src={cartItem.item.image} alt={cartItem.item.title} />
      <div className="cart-item-details">
        <h3>{cartItem.item.item}</h3>
        <p>
        {formatMoney(cartItem.item.price  * cartItem.quantity)}
        {' - '}
        <em>
          {cartItem.quantity} &times; 
          {formatMoney(cartItem.item.price)}
        </em>
        </p>
      </div>
      </CartItemsStyles>
  )
}

export default CartItem