require 'test_helper'

class DataControllerTest < ActionController::TestCase
  test "should get capacity" do
    get :capacity
    assert_response :success
  end

end
