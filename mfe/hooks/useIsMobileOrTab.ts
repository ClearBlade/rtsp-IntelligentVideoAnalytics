import { useState, useEffect } from 'react';

const useIsMobileOrTab = () => {
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  const updateDeviceType = () => {
    const width = window.innerWidth;
    if (width <= 768) {
      setDeviceType('mobile');
    } else if (width > 768 && width <= 1024) {
      setDeviceType('tablet');
    } else {
      setDeviceType('desktop');
    }
  };

  useEffect(() => {
    updateDeviceType();
    window.addEventListener('resize', updateDeviceType);
    return () => window.removeEventListener('resize', updateDeviceType);
  }, []);

  return deviceType;
};

export default useIsMobileOrTab;