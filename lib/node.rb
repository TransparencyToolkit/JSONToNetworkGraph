require 'json'

class Node
  def initialize(num, name, type, value)
    @num = num
    @name = name
    @type = type
    @value = Array.new
    @value.push(value)
  end

  def update(toadd)
    @value.push(toadd)
  end
  
  def getID
    return @num
  end

  def nodeData
    json_array = [:id => @name, :type => @type]
  end
end
