// BlueBar.js
import React from 'react';
import { styled } from 'shadcn-ui';

const Header = styled('div', {
    backgroundColor: 'blue',
    height: '50px',
    width: '100%',
    position: 'fixed',
    top: 0,
    left: 0,
});

const BlueBar = () => {
    return <Bar />;
};

export default Header;
