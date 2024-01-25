import DayMondayItem from "./dayMonday.component";
import DayTuesdayItem from "./dayTuesday.component";

const DaysContainerItem = () => {
  return (
    <div className="days flex-column gap-7">
      <DayMondayItem></DayMondayItem>
      <DayTuesdayItem></DayTuesdayItem>
    </div>
  );
};
export default DaysContainerItem;
