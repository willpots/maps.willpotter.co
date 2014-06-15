class DataController < ApplicationController
  def capacity
    uri = URI("http://www.thehubway.com/data/stations/bikeStations.xml")
    response = Net::HTTP.get(uri) # => String
    @data = Hash.from_xml(response.gsub("\n", "")) 
    respond_to do |format|
      format.html do

      end
      format.json do
        render json: @data
      end
    end
  end
end
