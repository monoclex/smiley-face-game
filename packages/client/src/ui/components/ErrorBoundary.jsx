//@ts-check
import React, { Component } from "react";
import PropTypes from "prop-types";
import { runTeardowns } from "../hooks/useTeardown";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: undefined };
    this.props.callback && this.props.callback(this.recover.bind(this));
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  recover() {
    runTeardowns();
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

    if (this.props.render) {
      const Render = this.props.render;
      return <Render error={error} />;
    }

    return (
      <>
        <h1>Something went wrong</h1>
        <p>{error.toString()}</p>
        <code>{error.stack}</code>
      </>
    );
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};
