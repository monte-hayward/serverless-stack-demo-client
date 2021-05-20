module.exports = {
  "env": {
    "node": true,
    "browser": true,
    "es2021": true,
    "jest": true,
  },
  "extends": [
    "react-app",
    "react-app/jest",

    // "eslint:recommended",
    // "plugin:react/recommended"
  ],
  "parserOptions": {
    "ecmaFeatures": {
      "classes": true,
      "jsx": true,
    },
    "ecmaVersion": 12,
    "sourceType": "module"
  },
  "plugins": [
    "react",
    "react-hooks"
  ],
  "rules": {
    "react-hooks/rules-of-hooks": "warn", // Checks rules of Hooks
    "react-hooks/exhaustive-deps": "warn", // Checks effect dependencies

    //TODO: remove these workarounds and fix the legacy code
    "react/prop-types": [2, {
      ignore: [
        'children',
        'className',
        'appProps',
        'disabled',
        'component',
        'href',
        'stripe',
        'stripe.createToken',
        'isLoading',
        'onSubmit',
      ]
    }],
  "import/no-anonymous-default-export": [0],
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
};
