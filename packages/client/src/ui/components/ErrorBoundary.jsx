//@ts-check
import React from "react";
import PropTypes from "prop-types";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: undefined };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  recover() {
    this.setState({ hasError: false, error: undefined });
  }

  render() {
    const { children } = this.props;
    const { hasError, error } = this.state;

    if (!hasError) {
      return children;
    }

    // eslint-disable-next-line no-console
    console.error("error boundary caught:", error);

    return (
      <>
        <h1>Something went wrong</h1>
        <span>{error.toString()}</span>
        <span>{error.stack}</span>
      </>
    );
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};
