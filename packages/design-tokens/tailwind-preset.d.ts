declare const tailwindPreset: {
  theme: {
    extend: {
      colors: Record<string, string>;
      fontFamily: Record<string, string[]>;
      borderRadius: Record<string, string>;
      boxShadow: Record<string, string>;
    };
  };
};

export default tailwindPreset;
