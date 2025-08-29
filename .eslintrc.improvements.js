// ===============================================
// IMPROVED ESLINT CONFIGURATION
// Enhanced linting rules for better code quality
// ===============================================

module.exports = {
  // Additional rules for better code quality
  rules: {
    // React specific improvements
    'react/display-name': 'warn',
    'react/no-unused-prop-types': 'warn',
    'react/prefer-stateless-function': 'warn',
    'react/jsx-no-bind': ['warn', { allowArrowFunctions: true }],
    
    // Import organization
    'import/order': ['warn', {
      'groups': [
        'builtin',
        'external', 
        'internal',
        'parent',
        'sibling',
        'index'
      ],
      'newlines-between': 'always-and-inside-groups'
    }],
    
    // Code quality
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'warn',
    'no-unused-expressions': 'warn',
    'prefer-const': 'warn',
    
    // Performance
    'react-hooks/exhaustive-deps': 'warn',
    
    // Accessibility
    'jsx-a11y/anchor-is-valid': 'warn',
    'jsx-a11y/img-redundant-alt': 'warn'
  }
};