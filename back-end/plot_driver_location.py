import numpy as np
import matplotlib.pyplot as plt
import datetime


# Convert a list of dictionaries to a dictionary of dictionaries with the specified key values
def convert_list_to_dict(list_of_dicts, id):
    dict = {}
    for dict_item in list_of_dicts:
        dict_specs = {}
        for key, val in dict_item.items():
            if key != id:
                dict_specs[key] = val
        dict[dict_item[id]] = dict_specs
    return dict


## Part 2: stops visualization
def plot_stops(stops, ax):
    # Refactor stop points data for plotting
    names = []
    loc_x = []
    loc_y = []
    # Overlapping (repeated points) handling
    repetition = {}

    for stop in stops:
        names.append(stop["name"])
        loc_x.append(stop["x"])
        loc_y.append(stop["y"])
        if "{0}{1}".format(stop["x"], stop["y"]) not in repetition:
            repetition["{0}{1}".format(stop["x"], stop["y"])] = 1
        else:
            repetition["{0}{1}".format(stop["x"], stop["y"])] += 1

    # Plotting and annotating stop points
    median_x = np.median(loc_x)
    # Legend counts (for avoiding duplicate labels in legend)
    leg1_count = 0
    leg2_count = 0
    leg3_count = 0
    leg4_count = 0
    for i in range(len(names)):

        if loc_x[i] < median_x:
            h_align = "right"
            delta_x = -1
        else:
            h_align = "left"
            delta_x = 1

        # Plotting actual points including handling of up to 4 repetitions
        if repetition["{0}{1}".format(loc_x[i], loc_y[i])] == 1 or repetition["{0}{1}".format(loc_x[i], loc_y[i])] > 4:
            v_align = "bottom"
            delta_y = 0.5
            txt_color = "black"
            # Plot the point
            if leg1_count == 0:
                label1 = "Stop"
                leg1_count += 1
            else:
                label1 = None
            ax.scatter(loc_x[i], loc_y[i], s=15, alpha=0.7, marker='x', color="c", label=label1, zorder=1)
        elif repetition["{0}{1}".format(loc_x[i], loc_y[i])] == 2:
            v_align = "top"
            delta_y = -2
            repetition["{0}{1}".format(stop["x"], stop["y"])] -= 1
            txt_color = "blue"
            # Plot the point
            if leg2_count == 0:
                label2 = "Stop"
                leg2_count += 1
            else:
                label2 = None
            ax.scatter(loc_x[i], loc_y[i], s=15, alpha=0.5, marker='*', color=txt_color, label=label2, zorder=1)
        elif repetition["{0}{1}".format(loc_x[i], loc_y[i])] == 3:
            if h_align == "right":
                h_align = "left"
            else:
                h_align = "right"
            delta_x = -delta_x
            v_align = "top"
            delta_y = -2
            repetition["{0}{1}".format(stop["x"], stop["y"])] -= 1
            txt_color = "darkgreen"
            # Plot the point
            if leg3_count == 0:
                label3 = "Stop"
                leg3_count += 1
            else:
                label3 = None
            ax.scatter(loc_x[i], loc_y[i], s=15, alpha=0.5, marker='1', color=txt_color, label=label3, zorder=1)
        elif repetition["{0}{1}".format(loc_x[i], loc_y[i])] == 4:
            if h_align == "right":
                h_align = "left"
            else:
                h_align = "right"
            delta_x = -delta_x
            v_align = "bottom"
            delta_y = 0.5
            repetition["{0}{1}".format(stop["x"], stop["y"])] -= 1
            txt_color = "brown"
            # Plot the point
            if leg4_count == 0:
                label4 = "Stop"
                leg4_count += 1
            else:
                label4 = None
            ax.scatter(loc_x[i], loc_y[i], s=15, alpha=0.5, marker=',', color=txt_color, label=label4, zorder=1)

        # Annotating the points
        ax.annotate(names[i],
                    (loc_x[i] + delta_x, loc_y[i] + delta_y),
                    size=12,
                    alpha=0.7,
                    horizontalalignment=h_align,
                    verticalalignment=v_align,
                    color=txt_color)
    return ax


## Part 4: visualization of drivers, location
def plot_driver(ax, driver_location, stops_dict):

    leg_progress = int(driver_location["legProgress"]) / 100
    loc_driver_x = np.array([])
    loc_driver_y = np.array([])

    # Computing driver location
    for stop in driver_location["activeLegID"]:
        loc_driver_x = np.append(loc_driver_x, stops_dict[stop]["x"])
        loc_driver_y = np.append(loc_driver_y, stops_dict[stop]["y"])

    delta_x = loc_driver_x[1] - loc_driver_x[0]
    delta_y = loc_driver_y[1] - loc_driver_y[0]
    x = delta_x * leg_progress + loc_driver_x[0]
    y = delta_y * leg_progress + loc_driver_y[0]

    # Computing driver direction
    k = delta_y / (delta_x + 0.000000001)
    rot_deg = np.rad2deg(np.arctan(k))
    if delta_x < 0:
        rot_deg = rot_deg - 90 + 180
    else:
        rot_deg = rot_deg - 90

    # Plotting the driver's position (depends on location and rotation)
    ax.scatter(x, y, s=100, alpha=0.9, marker=(3, 0, rot_deg), color="red", label="Driver", zorder=2)

    return ax


## Part 5: visualization of the completed section of the leg where the driver is, as well as completed legs
def plot_legs(ax, driver_location, stops_dict):
    leg_progress = int(driver_location["legProgress"]) / 100
    loc_driver_x = np.array([])
    loc_driver_y = np.array([])
    # Computing driver location
    for stop in driver_location["activeLegID"]:
        loc_driver_x = np.append(loc_driver_x, stops_dict[stop]["x"])
        loc_driver_y = np.append(loc_driver_y, stops_dict[stop]["y"])

    # Refactor stop points data for plotting
    loc_x = []
    loc_y = []

    for key, val in stops_dict.items():
        loc_x.append(val['x'])
        loc_y.append(val['y'])
        if key == driver_location["activeLegID"][0]:
            delta_x = loc_driver_x[1] - loc_driver_x[0]
            delta_y = loc_driver_y[1] - loc_driver_y[0]
            x = delta_x * leg_progress + loc_driver_x[0]
            y = delta_y * leg_progress + loc_driver_y[0]
            loc_x.append(x)
            loc_y.append(y)
            break
    # Plotting completed path (legs)
    ax.plot(loc_x, loc_y, color="c", alpha=0.8, label="Completed path", zorder=0)

    return ax


# Driver's data visualization
def plot_truck_data(stops, driver_location, stops_dict, is_plot_stops=True, is_plot_driver=True, is_plot_legs=True):
    # Plot initialization
    fig, ax = plt.subplots()
    # ax.scatter(loc_x, loc_y, s=15, alpha=0.7, marker='x', color="c")
    ax.set_title("Truck stops")
    ax.set_xlabel("X")
    ax.set_ylabel("Y")
    ax.set_xlim([0, 200])
    ax.set_ylim([0, 200])

    if is_plot_stops:
        ax = plot_stops(stops, ax)
    if is_plot_driver:
        ax = plot_driver(ax, driver_location, stops_dict)
    if is_plot_legs:
        ax = plot_legs(ax, driver_location, stops_dict)

    plt.legend(title="Legend", loc=1)

    timestamp_fig = datetime.datetime.now().isoformat().replace(':', '_')
    plt.savefig("figures/figure_{0}.png".format(timestamp_fig))
    # plt.show()