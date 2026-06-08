'use client'

type Props = {
  id: string;
  label: string;
  top: number;
  left: number;
  width: number;
  height: number;
  onClick: (id: string) => void;
};

export const RoomHotspot = ({
  id,
  label,
  top,
  left,
  width,
  height,
  onClick,
}: Props) => (
  <button
    className="room-hotspot"
    data-id={id}
    aria-label={label}
    style={{
      top: `${top}%`,
      left: `${left}%`,
      width: `${width}%`,
      height: `${height}%`,
    }}
    onClick={() => onClick(id)}
  >
    <span className="room-hotspot__label">{label}</span>
  </button>
)
