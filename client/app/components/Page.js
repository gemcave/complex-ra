import React, { useEffect } from 'react';
import Container from './Container';

const Page = (props) => {
  useEffect(() => {
    document.title = `${props.title} | ComplexRa`;
    window.scrollTo(0, 0);
  }, [props.title]);

  return <Container>{props.children}</Container>;
};

export default Page;
