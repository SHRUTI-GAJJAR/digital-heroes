function RouteLoading({ message = "Loading…" }) {
  return <div className="route-loading"><div className="route-loading-spinner" /><p>{message}</p></div>;
}

export default RouteLoading;
