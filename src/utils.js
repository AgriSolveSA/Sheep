export const ZAR   = (n, d = 0) => `R ${Math.abs(isNaN(n) ? 0 : n).toFixed(d).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
export const PCT   = n => `${((isNaN(n) ? 0 : n) * 100).toFixed(1)}%`;
export const SGN   = n => n >= 0 ? "+" : "−";
export const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
