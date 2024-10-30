// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {type JSX, useEffect, useState} from 'react';

type PropsType = {
  children: JSX.Element;
  waitBeforeShow?: number;
};
const Delayed = ({
  children,
  waitBeforeShow = 1,
}: PropsType): JSX.Element | null => {
  const [isShown, setIsShown] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsShown(true);
    }, waitBeforeShow);
    return () => clearTimeout(timer);
  }, [waitBeforeShow]);

  return isShown ? children : null;
};

export default Delayed;
