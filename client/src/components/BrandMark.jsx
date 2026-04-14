function BrandMark({ className = "" }) {
  const classes = ["rounded-2xl", className].filter(Boolean).join(" ");

  return <img alt="" aria-hidden="true" className={classes} src="/favicon.svg" />;
}

export default BrandMark;
