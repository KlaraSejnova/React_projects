import DayMondayItem from "./dayMonday.component";
import DayTuesdayItem from "./dayTuesday.component";

const DaysContainerItem = () => {
  return (
    <div className="days flex-column gap-7 border border-black-100 rounded-lg p-20 shadow-xl">
      <DayMondayItem></DayMondayItem>
      <DayTuesdayItem></DayTuesdayItem>
    </div>
  );
};
export default DaysContainerItem;
